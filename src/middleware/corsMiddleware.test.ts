import supertest from 'supertest';
import createApp from '../app';
import { mockConfig } from '../config';

describe('corsMiddleware', () => {
    describe('wildcard [] whitelist', () => {
        const config = mockConfig({ clientUrls: [] });
        const app = supertest(createApp(config));

        it('always allows undefined origin', async () => {
            const response = await app.get('/').send();

            expect(response.statusCode).toBe(200);
        });

        it('allows any origin', async () => {
            const response = await app.get('/').set('origin', 'https://example.com').send();

            expect(response.statusCode).toBe(200);
        });
    });

    describe('static whitelist', () => {
        const config = mockConfig({ clientUrls: ['https://example.com'] });
        const app = supertest(createApp(config));

        it('always allows undefined origin', async () => {
            const response = await app.get('/').send();

            expect(response.statusCode).toBe(200);
        });

        it("doesn't allow non-whitelisted origins", async () => {
            const response = await app.get('/').set('origin', 'https://google.com').send();

            expect(response.statusCode).toBe(500);
        });

        it('allows whitelisted origins', async () => {
            const response = await app.get('/').set('origin', 'https://example.com').send();

            expect(response.statusCode).toBe(200);
        });

        it('has matching Access-Control-Allow-Origin header', async () => {
            const response = await app.get('/').set('origin', 'https://example.com').send();

            expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
        });
    });
});
