import request from 'supertest';
import { Db } from 'mongodb';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken } from '../../helpers';
import { mockedOAuthResult, mockedUser } from '../../mocks';

describe('GET /users/@me', () => {
    const config = mockConfig();

    const mockToken = makeSiteToken(config, mockedOAuthResult, 'non-existent user id');

    it('returns status code 501 if no Mongo database is provided', async () => {
        const req = await request(createApp(config))
            .get('/users/@me')
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(req.statusCode).toBe(501);
    });

    it('returns status code 401 for invalid tokens', async () => {
        const req = await request(createApp(config)).get('/users/@me').set('Authorization', 'garbage token').send();

        expect(req.statusCode).toBe(401);
    });

    it('returns status code 404 when no user is found', async () => {
        const mockDb = { collection: () => ({ findOne: () => null }) } as unknown as Db;

        const req = await request(createApp(config, mockDb))
            .get('/users/@me')
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(req.statusCode).toBe(404);
    });

    it('returns the right user info', async () => {
        const mockDb = { collection: () => ({ findOne: () => mockedUser }) } as unknown as Db;
        const mockToken = makeSiteToken(config, mockedOAuthResult, 'non-existent user id');

        const req = await request(createApp(config, mockDb))
            .get('/users/@me')
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(mockedUser);
    });
});
