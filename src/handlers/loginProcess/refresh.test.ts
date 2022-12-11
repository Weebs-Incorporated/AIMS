import request from 'supertest';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken, getUserInfo, refreshAccessToken } from '../../helpers';
import { User } from '../../types';
import { mockedAPIUser, mockedOAuthResult, mockedOAuthResultNew, mockedUser } from '../../mocks';

jest.mock('../../helpers', () => {
    const originalModule = jest.requireActual('../../helpers');

    return {
        __esModule: true,
        ...originalModule,
        refreshAccessToken: jest.fn(),
        getUserInfo: jest.fn(),
        getAccessToken: jest.fn(),
        validateSiteToken: jest.fn(() => ({ id: '/refresh test user id', refresh_token: 'test refresh token' })),
        makeSiteToken: jest.fn(() => 'test new site token'),
    };
});

const mockedGetUserInfo = jest.mocked(getUserInfo);
const mockedRefreshAccessToken = jest.mocked(refreshAccessToken);

describe('GET /refresh', () => {
    const config = mockConfig();

    const mockToken = makeSiteToken(config, mockedOAuthResult, '/refresh test user id');

    const mockDb = { collection: () => ({ findOne: () => null }) } as unknown as Db;

    it('returns status code 500 when failing to get Discord user info', async () => {
        mockedRefreshAccessToken.mockResolvedValue(mockedOAuthResult);

        mockedGetUserInfo
            // returns null when access token is invalid
            .mockResolvedValueOnce(null)
            // throws error when request fails to be made
            .mockImplementationOnce(() => {
                throw new Error();
            });

        const mockDb = { collection: () => ({ findOne: () => mockedUser }) } as unknown as Db;

        const app = createApp(config, mockDb);

        const res1 = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();
        const res2 = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();

        expect(res1.statusCode).toBe(500);
        expect(res2.statusCode).toBe(500);

        // should differentiate between being unable to fetch user info due to error and unable to fetch due to bad
        // access token
        expect(res1.text).not.toBe(res2.text);
    });

    it('returns status code 501 if no Mongo database is provided', async () => {
        const req = await request(createApp(config)).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();

        expect(req.statusCode).toBe(501);
    });

    it('returns status code 401 for invalid tokens', async () => {
        const req = await request(createApp(mockConfig(), mockDb))
            .get('/refresh')
            .set('Authorization', 'garbage token')
            .send();

        expect(req.statusCode).toBe(401);
    });

    describe('user database interactions', () => {
        let mongoProvider: MongoMemoryServer;
        let mongoConsumer: MongoClient;

        beforeAll(async () => {
            mongoProvider = await MongoMemoryServer.create();
            const mongoURI = mongoProvider.getUri();
            mongoConsumer = new MongoClient(mongoURI);
            await mongoConsumer.connect();
        });

        afterAll(async () => {
            await mongoConsumer.close();
            await mongoProvider.stop();
        });

        afterEach(async () => {
            await mongoConsumer.db().collection<User>('users').deleteMany({});
        });

        it('returns status code 400 when refresh token is invalid', async () => {
            await mongoConsumer
                .db()
                .collection<User>('users')
                .insertOne({
                    ...mockedUser,
                    _id: '/refresh test user id',
                });

            mockedRefreshAccessToken.mockImplementationOnce(() => {
                throw new Error();
            });
            const req = await request(createApp(config, mongoConsumer.db()))
                .get('/refresh')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(req.statusCode).toBe(400);
        });

        it('returns status code 404 when no user is found', async () => {
            const req = await request(createApp(config, mongoConsumer.db()))
                .get('/refresh')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(req.statusCode).toBe(404);
        });

        describe('successful refreshes', () => {
            let response: request.Response;

            beforeAll(async () => {
                mockedRefreshAccessToken.mockResolvedValueOnce(mockedOAuthResultNew);
                mockedGetUserInfo.mockResolvedValueOnce(mockedAPIUser);

                await mongoConsumer
                    .db()
                    .collection<User>('users')
                    .insertOne({
                        ...mockedUser,
                        _id: '/refresh test user id',
                    });

                response = await request(createApp(config, mongoConsumer.db()))
                    .get('/refresh')
                    .set('Authorization', `Bearer ${mockToken}`)
                    .send();
            });

            it('returns status code 200', () => {
                expect(response.statusCode).toBe(200);
                expect(response.body.userData).not.toBeUndefined();
            });

            it('updates last login/refresh time', () => {
                expect(response.body.userData.lastLoginOrRefresh).not.toBe(mockedUser.lastLoginOrRefresh);
            });

            it('returns a new refresh token, and site token', () => {
                expect(response.body.refreshToken).toBe(mockedOAuthResultNew.refresh_token);
                expect(response.body.siteToken).toBe('test new site token');
            });
        });
    });
});
