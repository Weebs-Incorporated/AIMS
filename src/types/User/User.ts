import UserPermissions from './UserPermissions';

export default interface User {
    _id: string;

    username: string;

    discriminator: string;

    avatar: string | null;

    latestIp: string;

    permissions: UserPermissions;

    registered: string;

    lastLoginOrRefresh: string;

    posts: number;

    comments: number;
}
