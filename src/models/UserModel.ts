import { model, Schema } from 'mongoose';
import User from '../types/User/User';

export const UserSchema = new Schema<User>({
    name: String,
    password: String,
    latestIp: String,
    permissions: Number,
    registered: String,
    lastLoginOrRefresh: String,
    posts: Number,
    comments: Number,
});

const UserModel = model('users', UserSchema);

export default UserModel;
