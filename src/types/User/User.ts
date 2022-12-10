import { APIUser } from 'discord-api-types/v10';
import { UserPermissions } from './UserPermissions';

export interface User extends Pick<APIUser, 'username' | 'discriminator' | 'avatar'> {
    _id: string;
    latestIp: string;
    permissions: UserPermissions;
    registered: string;
    lastLoginOrRefresh: string;
    posts: number;
    comments: number;
}
