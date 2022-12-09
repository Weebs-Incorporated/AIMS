import { model, Schema } from 'mongoose';
import { User } from '../types/User/User';

export const UserSchema = new Schema<User>({
    _id: {
        type: String,
        required: true,
        immutable: true,
    },
    username: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    latestIp: {
        type: String,
        required: true,
    },
    permissions: {
        type: Number,
        required: true,
    },
    registered: {
        type: String,
        required: true,
        immutable: true,
    },
    lastLoginOrRefresh: {
        type: String,
        required: true,
    },
    posts: Number,
    comments: Number,
});

export const UserModel = model('users', UserSchema);
