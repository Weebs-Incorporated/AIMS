import { Express } from 'express';
import request from 'supertest';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { getAccessToken, getUserInfo, makeSiteToken } from '../../helpers';
import { User } from '../../types';
import { mockedAPIUser, mockedOAuthResult, mockedUser } from '../../mocks';

jest.mock('../../helpers');

const mockedGetAccessToken = jest.mocked(getAccessToken);
const mockedGetUserInfo = jest.mocked(getUserInfo);
const mockedMakeSiteToken = jest.mocked(makeSiteToken);

describe('POST /login', () => {
    let app: Express;
    let mongoProvider: MongoMemoryServer;
    let mongoConsumer: MongoClient;

    const mockLoginBody = {
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

    it('returns status code 501 if no Mongo database is provided', async () => {
        const req = await request(createApp(mockConfig())).post('/login').send(mockLoginBody);

        expect(req.statusCode).toBe(501);
    });

    it('returns status code 400 for invalid codes or redirect URIs', async () => {
        mockedGetAccessToken.mockImplementationOnce(() => {
            throw new Error();
        });

        const res = await request(app).post('/login').send(mockLoginBody);

        expect(res.statusCode).toBe(400);
    });

    it('returns status code 500 when failing to get Discord user info', async () => {
        mockedGetAccessToken.mockResolvedValue(mockedOAuthResult);

        mockedGetUserInfo
            // returns null when access token is invalid
            .mockResolvedValueOnce(null)
            // throws error when request fails to be made
            .mockImplementationOnce(() => {
                throw new Error();
            });

        const res1 = await request(app).post('/login').send(mockLoginBody);
        const res2 = await request(app).post('/login').send(mockLoginBody);

        expect(res1.statusCode).toBe(500);
        expect(res2.statusCode).toBe(500);

        // should differentiate between being unable to fetch user info due to error and unable to fetch due to bad
        // access token
        expect(res1.text).not.toBe(res2.text);
    });

    describe('user creation and updating', () => {
        beforeAll(() => {
            mockedGetAccessToken.mockResolvedValue(mockedOAuthResult);
            mockedGetUserInfo.mockResolvedValue(mockedAPIUser);
            mockedMakeSiteToken.mockReturnValue('test site token');
        });

        afterEach(async () => {
            await mongoConsumer.db().collection<User>('users').deleteMany({});
        });

        it('creates a new user', async () => {
            const res = await request(app).post('/login').send(mockLoginBody);

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
            await mongoConsumer
                .db()
                .collection<User>('users')
                .insertOne({ ...mockedUser, _id: 'test Discord user id' });

            const res = await request(app).post('/login').send(mockLoginBody);

            expect(res.statusCode).toBe(200);
            expect(res.body.type).toBe('login');

            const updatedUser = await mongoConsumer
                .db()
                .collection('users')
                .findOne<User>({ _id: res.body.userData._id });

            if (updatedUser === null) fail('should have updated a user');

            expect(updatedUser).toEqual(res.body.userData);
            expect(updatedUser.lastLoginOrRefresh).not.toBe(mockedUser.lastLoginOrRefresh);
            expect(updatedUser.registered).toBe(mockedUser.registered);
        });
    });
});
