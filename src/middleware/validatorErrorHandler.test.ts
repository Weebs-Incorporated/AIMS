import express from 'express';
import request from 'supertest';
import { createApp } from '../app';
import { mockConfig } from '../config';
import { validatorErrorHandler } from './validatorErrorHandler';
import { validatorMiddleware } from './validatorMiddleware';

describe('validatorErrorHandler', () => {
    it('applies to HttpError instances', async () => {
        const app = createApp(mockConfig());
        const res = await request(app).get('/nonExistent').send();

        expect(res.statusCode).toBe(404);
        expect(typeof res.body.message).toBe('string');
        expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("doesn't apply to other error instances", async () => {
        const config = mockConfig();
        const app = express();
        app.use(validatorMiddleware(config));
        app.use(validatorErrorHandler(config));

        app.get('/', () => {
            throw new Error('some error');
        });

        const res = await request(app).get('/').send();

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({});
    });
});
