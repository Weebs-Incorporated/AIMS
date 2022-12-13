import { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { User, UserPermissions } from '../types';

export const mockedOAuthResult: RESTPostOAuth2AccessTokenResult = {
    access_token: 'test access token',
    expires_in: 604800,
    refresh_token: 'test refresh token',
    scope: 'test scope',
    token_type: 'test token type',
};

export const mockedOAuthResultNew: RESTPostOAuth2AccessTokenResult = {
    access_token: 'new test access token',
    expires_in: 604800,
    refresh_token: 'new test refresh token',
    scope: 'test scope',
    token_type: 'test token type',
};

export const mockedAPIUser: APIUser = {
    id: 'test Discord user id',
    username: 'test Discord username',
    discriminator: 'test Discord discriminator',
    avatar: 'test Discord avatar',
};

export const mockedUser: User = {
    _id: 'test user id',
    username: 'test user id',
    discriminator: 'test user discriminator',
    avatar: 'test avatar',
    comments: 0,
    posts: 0,
    lastLoginOrRefresh: new Date().toISOString(),
    latestIp: 'test user ip',
    permissions: UserPermissions.Comment,
    registered: new Date().toISOString(),
};

export const mockedLoginBody = {
    code: 'test code',
    redirect_uri: 'test redirect uri',
};
