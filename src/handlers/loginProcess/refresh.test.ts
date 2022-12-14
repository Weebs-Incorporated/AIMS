import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken, getUserInfo, refreshAccessToken, validateSiteToken } from '../../helpers';
import {
    createTestDatabase,
    mockedAPIUser,
    mockedOAuthResult,
    mockedOAuthResultNew,
    mockedUser,
    TestDatabase,
} from '../../testing';

jest.mock('../../helpers');

const mockedValidateSiteToken = jest.mocked(validateSiteToken);

const mockedRefreshAccessToken = jest.mocked(refreshAccessToken);
const mockedGetUserInfo = jest.mocked(getUserInfo);
const mockedMakeSiteToken = jest.mocked(makeSiteToken);

const mockToken = makeSiteToken(mockConfig(), mockedOAuthResult, '/refresh test user id');

describe('GET /refresh', () => {
    let app: Express;
    let testDatabase: TestDatabase;

    mockedValidateSiteToken.mockReturnValue({
        id: '/refresh test user id',
        access_token: 'test access token',
        refresh_token: 'test refresh token',
    });

    beforeAll(async () => {
        testDatabase = await createTestDatabase();
        app = createApp(mockConfig(), testDatabase.db);
    });

    afterAll(async () => {
        await testDatabase.shutdown();
    });

    it('returns status code 404 when no user is found', async () => {
        const req = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();

        expect(req.statusCode).toBe(404);
    });

    it('returns status code 400 when refresh token is invalid', async () => {
        await testDatabase.db.users.insertOne({
            ...mockedUser,
            _id: '/refresh test user id',
        });

        mockedRefreshAccessToken.mockImplementationOnce(() => {
            throw new Error();
        });

        const req = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();

        await testDatabase.db.users.deleteMany({});

        expect(req.statusCode).toBe(400);
    });

    it('returns status code 500 when failing to get Discord user info', async () => {
        await testDatabase.db.users.insertOne({
            ...mockedUser,
            _id: '/refresh test user id',
        });

        mockedRefreshAccessToken.mockResolvedValue(mockedOAuthResult);

        mockedGetUserInfo
            // returns null when access token is invalid
            .mockResolvedValueOnce(null)
            // throws error when request fails to be made
            .mockImplementationOnce(() => {
                throw new Error();
            });

        const res1 = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();
        const res2 = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();

        await testDatabase.db.users.deleteMany({});

        expect(res1.statusCode).toBe(500);
        expect(res2.statusCode).toBe(500);

        // should differentiate between being unable to fetch user info due to error and unable to fetch due to bad
        // access token
        expect(res1.text).not.toBe(res2.text);
    });

    describe('user database interactions', () => {
        let response: request.Response;

        beforeAll(async () => {
            await testDatabase.db.users.insertOne({
                ...mockedUser,
                _id: '/refresh test user id',
            });

            mockedRefreshAccessToken.mockResolvedValueOnce(mockedOAuthResultNew);
            mockedGetUserInfo.mockResolvedValueOnce(mockedAPIUser);
            mockedMakeSiteToken.mockReturnValueOnce('test new site token');

            response = await request(app).get('/refresh').set('Authorization', `Bearer ${mockToken}`).send();
        });

        it('returns status code 200', () => {
            expect(response.statusCode).toBe(200);
            expect(response.body.userData).not.toBeUndefined();
        });

        it('updates last login/refresh time', async () => {
            expect(response.body.userData.lastLoginOrRefresh).not.toBe(mockedUser.lastLoginOrRefresh);

            const updatedUser = await testDatabase.db.users.findOne({ _id: '/refresh test user id' });

            if (updatedUser === null) fail('user in database was deleted');

            expect(updatedUser).toEqual(response.body.userData);
        });

        it('returns a new site token', () => {
            expect(response.body.siteToken).toBe('test new site token');
        });
    });
});
