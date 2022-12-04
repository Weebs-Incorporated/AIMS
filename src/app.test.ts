import request from 'supertest';
import createApp from './app';
import { mockConfig } from './config';

describe('app', () => {
    it('returns status code 200', async () => {
        const response = await request(createApp(mockConfig())).get('/').send();

        expect(response.statusCode).toBe(200);
    });
});
