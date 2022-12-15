import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken } from '../../helpers';
import { createTestDatabase, mockedOAuthResult, mockedUser, TestDatabase } from '../../testing';
import { ClientFacingUser, User, UserPermissions } from '../../types';

describe('GET /users/:id', () => {
    const config = mockConfig();
    let app: Express;
    let testDatabase: TestDatabase;

    const users: Record<'normal' | 'owner', User> = {
        normal: { ...mockedUser, _id: 'normal' },
        owner: { ...mockedUser, _id: 'owner', permissions: UserPermissions.Owner },
    };

    const tokens: Record<'normal' | 'owner' | 'deleted', string> = {
        normal: makeSiteToken(config, mockedOAuthResult, 'normal'),
        owner: makeSiteToken(config, mockedOAuthResult, 'owner'),
        deleted: makeSiteToken(config, mockedOAuthResult, 'deleted'),
    };

    beforeAll(async () => {
        testDatabase = await createTestDatabase();
        app = createApp(config, testDatabase.db);

        await testDatabase.db.users.insertMany([users.normal, users.owner]);
    });

    afterAll(async () => {
        await testDatabase.shutdown();
    });

    it('returns status code 404 when no user is found', async () => {
        const res = await request(app).get('/users/12345').send();
        expect(res.statusCode).toBe(404);
    });

    it('returns safe user info for unauthenticated requests', async () => {
        const res = await request(app).get('/users/normal').send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<ClientFacingUser>({ ...users.normal, latestIp: null });
    });

    it('returns safe user info for requests by deleted users', async () => {
        const res = await request(app).get('/users/normal').set('Authorization', `Bearer ${tokens.deleted}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<ClientFacingUser>({ ...users.normal, latestIp: null });
    });

    it('returns safe user info for unauthorized requests', async () => {
        const res = await request(app).get('/users/owner').set('Authorization', `Bearer ${tokens.normal}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<ClientFacingUser>({ ...users.owner, latestIp: null });
    });

    it('returns full user info for self requests', async () => {
        const res = await request(app).get('/users/normal').set('Authorization', `Bearer ${tokens.normal}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<ClientFacingUser>(users.normal);
    });

    it('returns full user info for authorized requests', async () => {
        const res = await request(app).get('/users/normal').set('Authorization', `Bearer ${tokens.owner}`).send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<ClientFacingUser>(users.normal);
    });
});
