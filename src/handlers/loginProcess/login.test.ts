import { Express } from 'express';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { getAccessToken, getUserInfo, makeSiteToken } from '../../helpers';
import { MongoClient } from 'mongodb';
import { User, UserPermissions } from '../../types';

jest.mock('../../helpers');

const mockedGetAccessToken = jest.mocked(getAccessToken);
const mockedGetUserInfo = jest.mocked(getUserInfo);
const mockedMakeSiteToken = jest.mocked(makeSiteToken);

describe('POST /login', () => {
    let app: Express;
    let mongoProvider: MongoMemoryServer;
    let mongoConsumer: MongoClient;

    const testOAuthResult: RESTPostOAuth2AccessTokenResult = {
        access_token: 'test access token',
        expires_in: 604800,
        refresh_token: 'test refresh token',
        scope: 'test scope',
        token_type: 'test token type',
    };

    const testUserInfoResult: APIUser = {
        id: 'test /login id',
        username: 'test username',
        discriminator: 'test discriminator',
        avatar: 'test avatar',
    };

    const testBody = {
        code: 'test code',
        redirect_uri: 'test redirect uri',
    };

    beforeAll(async () => {
        mongoProvider = await MongoMemoryServer.create();
        const mongoURI = mongoProvider.getUri();
        mongoConsumer = new MongoClient(mongoURI);
        await mongoConsumer.connect();

        const db = mongoConsumer.db();

        app = createApp(mockConfig({ mongoURI }), db);
    });

    afterAll(async () => {
        await mongoConsumer.close();
        await mongoProvider.stop();
    });

    it('returns status code 400 for invalid codes or redirect URIs', async () => {
        mockedGetAccessToken.mockImplementationOnce(() => {
            throw new Error();
        });

        const res = await request(app).post('/login').send(testBody);

        expect(res.statusCode).toBe(400);
    });

    it('returns status code 500 when failing to get Discord user info', async () => {
        mockedGetAccessToken.mockResolvedValue(testOAuthResult);

        mockedGetUserInfo.mockResolvedValueOnce(null).mockImplementationOnce(() => {
            throw new Error();
        });

        const res1 = await request(app).post('/login').send(testBody);
        const res2 = await request(app).post('/login').send(testBody);

        expect(res1.statusCode).toBe(500);
        expect(res2.statusCode).toBe(500);

        // should differentiate between being unable to fetch user info due to error and unable to fetch due to bad
        // access token
        expect(res1.text).not.toBe(res2.text);
    });

    describe('user creation and updating', () => {
        beforeAll(() => {
            mockedGetAccessToken.mockResolvedValue(testOAuthResult);
            mockedGetUserInfo.mockResolvedValue(testUserInfoResult);
            mockedMakeSiteToken.mockReturnValue('test site token');
        });

        afterEach(async () => {
            await mongoConsumer.db().collection<User>('users').deleteMany({});
        });

        it('creates a new user', async () => {
            const res = await request(app).post('/login').send(testBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.type).toBe('register');

            const createdUser = await mongoConsumer
                .db()
                .collection('users')
                .findOne<User>({ _id: res.body.userData._id });

            if (createdUser === null) fail('should have created a user');

            expect(createdUser).toEqual(res.body.userData);
        });

        it('updates an existing user', async () => {
            const startingUser: User = {
                username: testUserInfoResult.username,
                discriminator: testUserInfoResult.discriminator,
                avatar: testUserInfoResult.avatar,
                _id: testUserInfoResult.id,
                comments: 0,
                posts: 0,
                lastLoginOrRefresh: new Date().toISOString(),
                latestIp: '123.456.789',
                permissions: UserPermissions.Comment,
                registered: new Date().toISOString(),
            };

            await mongoConsumer.db().collection<User>('users').insertOne(startingUser);

            const res = await request(app).post('/login').send(testBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.type).toBe('login');

            const updatedUser = await mongoConsumer
                .db()
                .collection('users')
                .findOne<User>({ _id: res.body.userData._id });

            if (updatedUser === null) fail('should have updated a user');

            expect(updatedUser).toEqual(res.body.userData);
            expect(updatedUser.lastLoginOrRefresh).not.toEqual(startingUser.lastLoginOrRefresh);
            expect(updatedUser.registered).toEqual(startingUser.registered);
        });
    });
});
