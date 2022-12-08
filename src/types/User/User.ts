import UserPermissions from './UserPermissions';

export default interface User {
    name: string;

    password: string;

    latestIp: string;

    permissions: UserPermissions;

    registered: string;

    lastLoginOrRefresh: string;

    posts: number;

    comments: number;
}
