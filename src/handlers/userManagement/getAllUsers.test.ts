import request from 'supertest';
import { Express } from 'express';
import { mockConfig } from '../../config';
import { createTestDatabase, mockedOAuthResult, mockedUser, TestDatabase } from '../../testing';
import { createApp } from '../../app';
import { ClientFacingUser, User, UserPermissions } from '../../types';
import { makeSiteToken } from '../../helpers';
import { GetAllUsersResponse } from './getAllUsers';

describe('POST /users/all', () => {
    const config = mockConfig();
    let app: Express;
    let testDatabase: TestDatabase;

    const users = new Array<User>(10).fill({} as User).map<User>((e, i) => ({
        ...mockedUser,
        _id: `test /users/all user ${i}`,
    }));

    const tokens = new Array<string>(10)
        .fill('')
        .map((e, i) => makeSiteToken(config, mockedOAuthResult, `test /users/all user ${i}`));

    users[0].permissions |= UserPermissions.Owner;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();
        app = createApp(config, testDatabase.db);

        await testDatabase.db.users.insertMany(users);
    });

    afterAll(async () => {
        await testDatabase.shutdown();
    });

    it('returns safe user info for unauthenticated requests', async () => {
        const res = await request(app)
            .post('/users/all')
            .send({ pagination: { page: 0, perPage: 20 }, withIds: null });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users: users.map<ClientFacingUser>((e) => ({ ...e, latestIp: null })),
            pagination: { itemCount: users.length },
        });
    });

    it('returns safe user info for unauthorized requests', async () => {
        const res = await request(app)
            .post('/users/all')
            .set('Authorization', `Bearer ${tokens[1]}`)
            .send({ pagination: { page: 0, perPage: 20 }, withIds: null });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users: users.map<ClientFacingUser>((e) => ({ ...e, latestIp: null })),
            pagination: { itemCount: users.length },
        });
    });

    it('returns full user info for authorized requests', async () => {
        const res = await request(app)
            .post('/users/all')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .send({ pagination: { page: 0, perPage: 20 }, withIds: null });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users,
            pagination: { itemCount: users.length },
        });
    });

    it('filters by ID when withIds is supplied', async () => {
        const withIds = new Array<string>(3).fill('').map((e, i) => `test /users/all user ${i + 4}`);

        const res = await request(app)
            .post('/users/all')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .send({ pagination: { page: 0, perPage: 20 }, withIds });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users: users.slice(4, 4 + withIds.length),
            pagination: { itemCount: withIds.length },
        });
    });

    it('respects page and perPage pagination inputs', async () => {
        const res = await request(app)
            .post('/users/all')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .send({ pagination: { page: 1, perPage: 3 }, withIds: null });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users: users.slice(3, 6),
            pagination: { itemCount: users.length },
        });
    });

    it('handles both pagination and withIds', async () => {
        const res = await request(app)
            .post('/users/all')
            .set('Authorization', `Bearer ${tokens[0]}`)
            .send({ pagination: { page: 1, perPage: 1 }, withIds: [users[0]._id, users[5]._id, users[7]._id] });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual<GetAllUsersResponse>({
            users: [users[5]],
            pagination: { itemCount: 3 },
        });
    });
});
