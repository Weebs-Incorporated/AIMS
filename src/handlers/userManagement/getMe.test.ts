import request from 'supertest';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { Db } from 'mongodb';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken } from '../../helpers';
import { User, UserPermissions } from '../../types';

describe('GET /users/@me', () => {
    const config = mockConfig();

    const testOAuthResult: RESTPostOAuth2AccessTokenResult = {
        access_token: 'test access token',
        expires_in: 604800,
        refresh_token: 'test refresh token',
        scope: 'test scope',
        token_type: 'test token type',
    };

    const mockToken = makeSiteToken(config, testOAuthResult, 'non-existent user id');

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
        const mockUser: User = {
            _id: 'test user id',
            avatar: null,
            comments: 0,
            discriminator: 'test user discriminator',
            lastLoginOrRefresh: new Date().toISOString(),
            latestIp: '123.456.789',
            permissions: UserPermissions.None,
            posts: 0,
            registered: new Date().toISOString(),
            username: 'test user',
        };

        const mockDb = { collection: () => ({ findOne: () => mockUser }) } as unknown as Db;
        const mockToken = makeSiteToken(config, testOAuthResult, 'non-existent user id');

        const req = await request(createApp(config, mockDb))
            .get('/users/@me')
            .set('Authorization', `Bearer ${mockToken}`)
            .send();

        expect(req.statusCode).toBe(200);
        expect(req.body).toEqual(mockUser);
    });
});
