import mongoose from 'mongoose';
import request from 'supertest';
import createApp from './app';
import { mockConfig } from './config';

describe('app', () => {
    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('returns status code 200', async () => {
        const response = await request(await createApp(mockConfig()))
            .get('/')
            .send();

        expect(response.statusCode).toBe(200);
    });

    it('connects to MongoDB', async () => {
        const response = await request(await createApp(mockConfig({ useEnv: true })))
            .get('/')
            .send();

        expect(response.statusCode).toBe(200);
    });
});
