import supertest from 'supertest';
import createApp from '../app';
import { mockConfig } from '../config';

describe('rateLimitingMiddleware', () => {
    it('rate limits according to config', async () => {
        const config = mockConfig({ maxRequestsPerMinute: 2 });
        const app = supertest(createApp(config));

        const response1 = await app.get('/').send();
        const response2 = await app.get('/').send();
        const response3 = await app.get('/').send();

        expect(response1.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
        expect(response3.statusCode).toBe(429);
    });

    it('accepts valid RateLimit-Bypass-Token headers', async () => {
        const config = mockConfig({ maxRequestsPerMinute: 1, rateLimitBypassTokens: ['someBypassToken'] });
        const app = supertest(createApp(config));

        await app.get('/').send();

        const nonBypassResponse = await app.get('/').send();

        const bypassResponse = await app.get('/').set('RateLimit-Bypass-Token', 'someBypassToken').send();

        expect(nonBypassResponse.statusCode).toBe(429);
        expect(bypassResponse.statusCode).toBe(200);

        expect(bypassResponse.headers['ratelimit-bypass-response']).toBe('Valid');
    });

    it('gives feedback for invalid RateLimit-Bypass-Token headers', async () => {
        const config = mockConfig({ maxRequestsPerMinute: 1, rateLimitBypassTokens: ['someBypassToken'] });
        const app = supertest(createApp(config));

        await app.get('/').send();

        const invalidTokenResponse = await app.get('/').set('RateLimit-Bypass-Token', 'someOtherBypassToken').send();

        expect(invalidTokenResponse.statusCode).toBe(429);

        expect(invalidTokenResponse.headers['ratelimit-bypass-response']).toBe('Invalid');
    });
});
