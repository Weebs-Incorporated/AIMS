import mongoose from 'mongoose';
import createApp from '../app';
import { mockConfig } from '../config';
import UserModel from './UserModel';
import UserPermissions from '../types/User/UserPermissions';

describe('UserModel', () => {
    afterAll(async () => {
        await mongoose.disconnect();
    });

    beforeAll(async () => {
        await createApp(mockConfig({ useEnv: true }));
    });

    afterEach(async () => {
        await UserModel.deleteMany();
    });

    it('creates a user', async () => {
        const createdUser = await UserModel.create({
            name: 'Test User',
            password: 'password123',
            latestIp: '123.456.789.012',
            permissions: UserPermissions.Comment,
            registered: new Date().toISOString(),
            lastLoginOrRefresh: new Date().toISOString(),
            posts: 0,
            comments: 0,
        });

        expect(await UserModel.findById(createdUser._id)).not.toBeNull();
    });
});
