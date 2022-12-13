import express from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../app';
import { mockConfig } from '../config';
import { SiteAuthError } from '../helpers';
import { AppDatabaseCollections } from '../types';
import { authErrorHandler } from './authErrorHandler';

describe('validatorErrorHandler', () => {
    const config = mockConfig();

    it('works on asynchronous route handlers', async () => {
        const res = await request(createApp(config, {} as AppDatabaseCollections))
            .get('/users/@me')
            .set('Authorization', 'Bearer abcdefg')
            .send();

        expect(res.statusCode).toBe(401);
        expect(typeof res.body.message).toBe('string');
    });

    it('applies to SiteAuthError instances', async () => {
        const app = express();

        app.get('/', () => {
            throw new SiteAuthError('some auth error');
        });

        app.use(authErrorHandler(config));

        const res = await request(app).get('/').send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('some auth error');
    });

    it('applies to JsonWebTokenError instances', async () => {
        const app = express();

        app.get('/', () => {
            throw new JsonWebTokenError('some auth error');
        });

        app.use(authErrorHandler(config));

        const res = await request(app).get('/').send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Some auth error');
    });

    it('applies to TokenExpireError instances', async () => {
        const app = express();

        app.get('/', () => {
            throw new TokenExpiredError('some auth error', new Date());
        });

        app.use(authErrorHandler(config));

        const res = await request(app).get('/').send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Some auth error');
    });
});
