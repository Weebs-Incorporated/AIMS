import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken } from '../../helpers';
import { createTestDatabase, mockedOAuthResult, mockedUser, TestDatabase } from '../../testing';

const mockToken = makeSiteToken(mockConfig(), mockedOAuthResult, '/users/@me test user id');

describe('GET /users/@me', () => {
    let app: Express;
    let testDatabase: TestDatabase;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();
        app = createApp(mockConfig(), testDatabase.db);
    });

    afterAll(async () => {
        await testDatabase.shutdown();
    });

    it('returns status code 404 when no user is found', async () => {
        const req = await request(app).get('/users/@me').set('Authorization', `Bearer ${mockToken}`).send();

        expect(req.statusCode).toBe(404);
    });

    it('returns the right user info', async () => {
        await testDatabase.db.users.insertOne({
            ...mockedUser,
            _id: '/users/@me test user id',
        });

        const req = await request(app).get('/users/@me').set('Authorization', `Bearer ${mockToken}`).send();

        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual({ ...mockedUser, _id: '/users/@me test user id' });
    });
});
