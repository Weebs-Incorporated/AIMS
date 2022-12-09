import supertest, { SuperTest, Test } from 'supertest';
import { createApp } from '../app';
import { mockConfig } from '../config';

describe('corsMiddleware', () => {
    describe('wildcard [] whitelist', () => {
        let app: SuperTest<Test>;

        beforeAll(async () => {
            const config = mockConfig({ clientUrls: [] });
            app = supertest(await createApp(config));
        });

        it('always allows undefined origin', async () => {
            const response = await app.get('/').send();

            expect(response.statusCode).toBe(200);
        });

        it('allows any origin', async () => {
            const response = await app.get('/').set('origin', 'https://example.com').send();

            expect(response.statusCode).toBe(200);
        });

        it('has the same Access-Control-Allow-Origin header', async () => {
            const response1 = await app.get('/').set('origin', 'https://example.com').send();
            const response2 = await app.get('/').set('origin', 'https://google.com').send();

            expect(response1.headers['access-control-allow-origin']).toBe('*');
            expect(response2.headers['access-control-allow-origin']).toBe('*');
        });
    });

    describe('static whitelist', () => {
        let app: SuperTest<Test>;

        beforeAll(async () => {
            const config = mockConfig({ clientUrls: ['https://example.com'] });
            app = supertest(await createApp(config));
        });

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
