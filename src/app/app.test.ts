import request from 'supertest';
import { createApp } from './createApp';
import { mockConfig } from '../config';

describe('app', () => {
    it('returns status code 200', async () => {
        const response = await request(createApp(mockConfig())).get('/').send();

        expect(response.statusCode).toBe(200);
    });

    describe('GET /ip', () => {
        it('return IP addresses', async () => {
            const response = await request(createApp(mockConfig())).get('/ip').send();

            expect(response.text).toBe('::ffff:127.0.0.1');
        });
    });
});
