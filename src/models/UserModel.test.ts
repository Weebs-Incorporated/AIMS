import mongoose from 'mongoose';
import { createApp } from '../app';
import { mockConfig } from '../config';
import { User, UserPermissions } from '../types';
import { UserModel } from './UserModel';

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
        const newUser: User = {
            _id: '1',
            username: 'Test User',
            discriminator: '1234',
            avatar: null,
            latestIp: '123.456.789.012',
            permissions: UserPermissions.Comment,
            registered: new Date().toISOString(),
            lastLoginOrRefresh: new Date().toISOString(),
            posts: 0,
            comments: 0,
        };

        await UserModel.create(newUser);

        expect(await UserModel.findById(newUser._id)).not.toBeNull();
    });

    it('updates a user', async () => {
        const newUser: User = {
            _id: '1',
            username: 'Test User',
            discriminator: '1234',
            avatar: null,
            latestIp: '123.456.789.012',
            permissions: UserPermissions.Comment,
            registered: new Date().toISOString(),
            lastLoginOrRefresh: new Date().toISOString(),
            posts: 0,
            comments: 0,
        };

        await UserModel.create(newUser);

        newUser.username = 'Test User (modified)';

        await UserModel.findByIdAndUpdate(newUser._id, newUser);

        expect((await UserModel.findById(newUser._id))?.username).toBe('Test User (modified)');
    });

    it('does not update immutable values', async () => {
        const newUser: User = {
            _id: '1',
            username: 'Test User',
            discriminator: '1234',
            avatar: null,
            latestIp: '123.456.789.012',
            permissions: UserPermissions.Comment,
            registered: new Date().toISOString(),
            lastLoginOrRefresh: new Date().toISOString(),
            posts: 0,
            comments: 0,
        };

        await UserModel.create(newUser);

        newUser._id = '2';

        await UserModel.findByIdAndUpdate(newUser._id, newUser);

        expect(await UserModel.findById(newUser._id)).toBeNull();
        expect((await UserModel.findById('1'))?._id).toBe('1');

        newUser._id = '1';
        const prevRegistered = newUser.registered;
        newUser.registered = new Date().toISOString();

        await UserModel.findByIdAndUpdate(newUser._id, newUser);

        expect((await UserModel.findById(newUser._id))?.registered).toBe(prevRegistered);
    });
});
