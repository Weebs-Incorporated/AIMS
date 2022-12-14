import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { sign, verify } from 'jsonwebtoken';
import { Config } from '../config';

/** What is stored in a site token. */
export interface SiteTokenPayload {
    /** Discord user ID, used to reference this user in MongoDB. */
    id: string;

    /** User's access token, used for token revocation. */
    access_token: string;

    /** User's refresh token, used to extend their session if needed. */
    refresh_token: string;
}

/**
 * Creates a JsonWebToken of necessary user data.
 * @param {Config} config Config to get JWT secret from.
 * @param {RESTPostOAuth2AccessTokenResult} discordAuth Discord OAuth payload to get refresh token from.
 * @param {String} id Discord user ID.
 * @returns {String} Site token.
 */
export function makeSiteToken(config: Config, discordAuth: RESTPostOAuth2AccessTokenResult, id: string): string {
    const { access_token, refresh_token, expires_in } = discordAuth;
    const payload: SiteTokenPayload = { id, access_token, refresh_token };

    return sign(payload, config.jwtSecret, { expiresIn: expires_in });
}

export class SiteAuthError extends Error {}

/**
 * Validates an authorization header.
 * @param {Config} config Config to get JWT secret from.
 * @param {string|undefined} token Authorization header value.
 * @returns {SiteTokenPayload} Decoded site token.
 * @throws Throws a {@link SiteAuthError}, JsonWebTokenError, or a TokenExpiredError if the token is invalid.
 */
export function validateSiteToken(config: Config, token: string | undefined): SiteTokenPayload {
    if (token === undefined) throw new SiteAuthError('Missing authorization header');

    if (token.toLowerCase().startsWith('bearer ')) token = token.slice('bearer '.length);

    const payload = verify(token, config.jwtSecret);

    if (typeof payload === 'string') {
        throw new SiteAuthError('Token has invalid payload type (got string, expected object)');
    }

    if (payload.exp === undefined) throw new SiteAuthError('Token lacks an expiration date');

    if (payload['id'] === undefined || typeof payload['id'] !== 'string') {
        throw new SiteAuthError('No ID in payload');
    }

    if (payload['access_token'] === undefined || typeof payload['access_token'] !== 'string') {
        throw new SiteAuthError('No access_token in payload');
    }

    if (payload['refresh_token'] === undefined || typeof payload['refresh_token'] !== 'string') {
        throw new SiteAuthError('No refresh_token in payload');
    }

    return {
        id: payload['id'],
        access_token: payload['access_token'],
        refresh_token: payload['refresh_token'],
    };
}
