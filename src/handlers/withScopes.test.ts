import express, { Request } from 'express';
import request from 'supertest';
import { mockConfig } from '../config';
import { makeSiteToken, SiteTokenPayload } from '../helpers';
import { authErrorHandler } from '../middleware/authErrorHandler';
import { mockedOAuthResult } from '../testing';
import { AppDatabaseCollections, EndpointProvider } from '../types';
import { withOptionalAuth, withScopes } from './withScopes';

describe('withScopes', () => {
    const config = mockConfig();

    const providerNoScopes: EndpointProvider<void, void> = {
        scopes: 'none',
        applyToRoute: () => (_req, res) => res.sendStatus(200),
    };

    const providerDbScope: EndpointProvider<void, void> = {
        scopes: 'db',
        applyToRoute: () => (_req, res) => res.sendStatus(200),
    };

    const providerAuthScope: EndpointProvider<void, object> = {
        scopes: 'auth',
        applyToRoute:
            ({ auth }) =>
            (_req, res) =>
                res.status(200).json(auth),
    };

    const providerBothScopes: EndpointProvider<void, void> = {
        scopes: 'both',
        applyToRoute: () => (_req, res) => res.sendStatus(200),
    };

    describe('scopes: none', () => {
        it('returns status code 200', async () => {
            const app = express();

            app.get('/', withScopes(providerNoScopes, config));

            const res = await request(app).get('/').send();

            expect(res.statusCode).toBe(200);
        });
    });

    describe('scopes: db', () => {
        it('returns status code 501 when no db is supplied', async () => {
            const app = express();

            app.get('/', withScopes(providerDbScope, config));

            const res = await request(app).get('/').send();

            expect(res.statusCode).toBe(501);
        });

        it('returns status code 200 when a db is supplied', async () => {
            const app = express();

            app.get('/', withScopes(providerDbScope, config, {} as AppDatabaseCollections));

            const res = await request(app).get('/').send();

            expect(res.statusCode).toBe(200);
        });
    });

    describe('scopes: auth', () => {
        it('returns status code 401 when authorization header is invalid or missing', async () => {
            const app = express();

            app.get('/', withScopes(providerAuthScope, config));
            app.use(authErrorHandler(config));

            const res = await request(app).get('/').send();

            expect(res.statusCode).toBe(401);
        });

        it('returns status code 200 when authorization header is valid', async () => {
            const app = express();

            app.get('/', withScopes(providerAuthScope, config));
            app.use(authErrorHandler(config));

            const res = await request(app)
                .get('/')
                .set('Authorization', `Bearer ${makeSiteToken(config, mockedOAuthResult, 'withScopes test user id')}`)
                .send();

            expect(res.statusCode).toBe(200);
        });
    });

    describe('scopes: both', () => {
        it('returns status code 401 when authorization header is invalid or missing', async () => {
            const app = express();

            app.get('/', withScopes(providerBothScopes, config, {} as AppDatabaseCollections));
            app.use(authErrorHandler(config));

            const res = await request(app).get('/').send();

            expect(res.statusCode).toBe(401);
        });

        it('returns status code 501 when no db is supplied', async () => {
            const app = express();

            app.get('/', withScopes(providerBothScopes, config));

            const res = await request(app)
                .get('/')
                .set('Authorization', `Bearer ${makeSiteToken(config, mockedOAuthResult, 'withScopes test user id')}`)
                .send();

            expect(res.statusCode).toBe(501);
        });

        it('returns status code 200 when all necessary information is provided', async () => {
            const app = express();

            app.get('/', withScopes(providerBothScopes, config, {} as AppDatabaseCollections));

            const res = await request(app)
                .get('/')
                .set('Authorization', `Bearer ${makeSiteToken(config, mockedOAuthResult, 'withScopes test user id')}`)
                .send();

            expect(res.statusCode).toBe(200);
        });
    });
});

describe('withOptionalAuth', () => {
    const config = mockConfig();

    it('returns null when authorization is omitted', () => {
        expect(withOptionalAuth(config, { get: () => undefined } as unknown as Request)).toBe(null);
    });

    it('returns token payload when authorization is valid', () => {
        const mockAuth = makeSiteToken(config, mockedOAuthResult, 'withScopes test user id');

        const expected: SiteTokenPayload = {
            id: 'withScopes test user id',
            access_token: mockedOAuthResult.access_token,
            refresh_token: mockedOAuthResult.refresh_token,
        };

        expect(withOptionalAuth(config, { get: () => mockAuth } as unknown as Request)).toEqual(expected);
    });

    it('throws an error when authorization is invalid', () => {
        const mockAuth = 'Bearer blah blah blah';

        expect(() => withOptionalAuth(config, { get: () => mockAuth } as unknown as Request)).toThrowError();
    });
});
