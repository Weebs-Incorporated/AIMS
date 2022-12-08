import axios from 'axios';
import { randomBytes } from 'crypto';
import { OAuth2Routes, OAuth2Scopes, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { URLSearchParams } from 'url';
import { Config } from '../config';

function makeRequestBody(config: Config): URLSearchParams {
    const params = new URLSearchParams();
    params.set('client_id', config.discordClientId);
    params.set('client_secret', config.discordClientSecret);
    return params;
}

const SCOPES: OAuth2Scopes[] = [OAuth2Scopes.Identify];

/**
 * Generates a Discord OAuth2 link for signing into the site with.
 *
 * Clients should implement their own version of this.
 *
 *
 * @param {Config} config Config to get client ID from.
 * @param {String} redirectUri Redirect URI (should exactly match one from the application settings).
 * @returns {string} Clickable authorization link.
 */
export function makeAuthorizationLink(config: Config, redirectUri: string): string {
    const state = randomBytes(16).toString('hex');

    const params = new URLSearchParams();
    params.set('client_id', config.discordClientId);
    params.set('state', state);
    params.set('redirect_uri', redirectUri);
    params.set('prompt', 'consent');
    params.set('scope', SCOPES.join(' '));

    return `${OAuth2Routes.authorizationURL}?${params.toString()}`;
}

/**
 * Makes a POST request to the Discord token URL, used to upgrade an authorization code into an access token.
 * @param {Config} config Config to get client ID and client secret from.
 * @param {String} authCode Authorization code returned by Discord.
 * @param {String} redirectUri Redirect URI (should exactly match one from the application settings).
 * @returns {Promise<RESTPostOAuth2AccessTokenResult>} Access token information.
 * @throws Throws an error if the provided code is invalid.
 */
export async function getAccessToken(
    config: Config,
    authCode: string,
    redirectUri: string,
): Promise<RESTPostOAuth2AccessTokenResult> {
    const body = makeRequestBody(config);
    body.set('code', authCode);
    body.set('redirect_uri', redirectUri);
    body.set('grant_type', 'authorization_code');

    const { data } = await axios.post<RESTPostOAuth2AccessTokenResult>(OAuth2Routes.tokenURL, body);
    return data;
}

/**
 * Makes a POST request to the Discord token refresh URL, used to delay expiration of an access token.
 * @param {Config} config Config to get client ID and client secret from.
 * @param {String} refreshToken Refresh token for the current session, returned by {@link getAccessToken} and
 * {@link refreshAccessToken}.
 * @returns {Promise<RESTPostOAuth2AccessTokenResult>} New access token information.
 * @throws Throws an error if the provided refresh token is invalid.
 */
export async function refreshAccessToken(
    config: Config,
    refreshToken: string,
): Promise<RESTPostOAuth2AccessTokenResult> {
    const body = makeRequestBody(config);
    body.set('refresh_token', refreshToken);
    body.set('grant_type', 'refresh_token');

    const { data } = await axios.post<RESTPostOAuth2AccessTokenResult>(OAuth2Routes.tokenURL, body);
    return data;
}

/**
 * Makes a POST request to the Discord token revocation URL, used to invalidate
 * an access token.
 * @param {Config} config Config to get client ID and client secret from.
 * @param {String} accessToken Access token for the current session.
 * @throws Throws an error if the provided access token is invalid.
 */
export async function revokeToken(config: Config, accessToken: string): Promise<void> {
    const body = makeRequestBody(config);
    body.set('token', accessToken);

    await axios.post(OAuth2Routes.tokenRevocationURL, body);
}
