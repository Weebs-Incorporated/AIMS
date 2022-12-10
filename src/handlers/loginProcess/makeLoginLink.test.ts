import request from 'supertest';
import { createApp } from '../../app';
import { mockConfig } from '../../config';

describe('GET /makeLoginLink', () => {
    it('returns a link based on config.port', async () => {
        const config = mockConfig({ port: 5000 });
        const app = createApp(config);

        const req = await request(app).get('/makeLoginLink').send();

        expect(req.statusCode).toBe(200);
        expect(req.text).toContain(config.port.toString());
    });
});
