import request from 'supertest';
import app from './app';

describe('app', () => {
    it('listens on a configured port', async () => {
        const response = await request(app).get('/').send();

        expect(response.statusCode).toBe(200);
    });
});
