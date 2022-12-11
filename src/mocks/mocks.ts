import { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

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
    discriminator: 'test discriminator',
    avatar: 'test avatar',
};
