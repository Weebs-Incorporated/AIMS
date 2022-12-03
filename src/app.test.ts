import request from 'supertest';
import app from './app';

describe('app', () => {
    it('returns status code 200', async () => {
        const response = await request(app).get('/').send();

        expect(response.statusCode).toBe(200);
    });
});
