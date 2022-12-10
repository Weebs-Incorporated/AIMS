import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { JsonWebTokenError, sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { mockConfig } from '../config';
import { makeSiteToken, validateSiteToken } from './siteTokenHelpers';

describe('siteTokenHelpers', () => {
    const exampleAuth: RESTPostOAuth2AccessTokenResult = {
        access_token: 'test access token',
        expires_in: 604800,
        refresh_token: 'test refresh token',
        scope: 'test scope',
        token_type: 'test token type',
    };

    describe('makeSiteToken', () => {
        it('signs the payload correctly', () => {
            const config = mockConfig({ jwtSecret: 'test secret' });

            const token = makeSiteToken(config, exampleAuth, 'test id');

            expect(verify(token, config.jwtSecret)).toMatchObject({
                id: 'test id',
                refresh_token: exampleAuth.refresh_token,
            });
        });
    });

    describe('validateSiteToken', () => {
        it('throws if token is missing', () => {
            try {
                validateSiteToken(mockConfig(), undefined);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toBe('Missing authorization header');
                } else fail('should have thrown an error');
            }
        });

        it('throws if token is malformed', () => {
            const token = 'garbage token';
            try {
                validateSiteToken(mockConfig(), token);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof JsonWebTokenError) {
                    expect(error.message).toBe('jwt malformed');
                } else fail('should have thrown a JsonWebTokenError');
            }
        });

        it('throws if token is signed with a different secret', () => {
            const token = sign({}, 'some secret');

            try {
                validateSiteToken(mockConfig({ jwtSecret: 'another secret' }), token);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof JsonWebTokenError) {
                    expect(error.message).toBe('invalid signature');
                } else fail('should have thrown a JsonWebTokenError');
            }
        });

        it('throws if token payload is not an object', () => {
            const config = mockConfig();

            const tokenString = sign('string payload', config.jwtSecret);

            try {
                validateSiteToken(config, tokenString);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('Token has invalid payload type');
                } else fail('should have thrown an error');
            }
        });

        it('throws if token lacks an expiration date', () => {
            const config = mockConfig();

            const tokenString = sign({}, config.jwtSecret);

            try {
                validateSiteToken(config, tokenString);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('Token lacks an expiration date');
                } else fail('should have thrown an error');
            }
        });

        it('throws if token is expired', () => {
            const config = mockConfig();

            const token = sign({}, config.jwtSecret, { expiresIn: 0 });

            try {
                validateSiteToken(config, token);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof TokenExpiredError) {
                    expect(error.message).toBe('jwt expired');
                } else fail('should have thrown a TokenExpiredError');
            }
        });

        it('throws if token payload has bad shape', () => {
            const config = mockConfig();

            const tokenA = sign({ refresh_token: 'test refresh token' }, config.jwtSecret, { expiresIn: 10 });

            const tokenB = sign({ id: 'test id' }, config.jwtSecret, { expiresIn: 10 });

            try {
                validateSiteToken(config, tokenA);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toBe('No ID in payload');
                } else fail('should have thrown an error');
            }

            try {
                validateSiteToken(config, tokenB);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toBe('No refresh_token in payload');
                } else fail('should have thrown an error');
            }
        });

        it('returns expected object for a valid token', () => {
            const testPayload = {
                id: 'test id',
                refresh_token: 'test refresh token',
            };

            const config = mockConfig();
            const token = sign(testPayload, config.jwtSecret, { expiresIn: 10 });

            const res = validateSiteToken(config, token);

            expect(res).toEqual(testPayload);
        });

        it('removes leading "bearer " if present', () => {
            const testPayload = {
                id: 'test id',
                refresh_token: 'test refresh token',
            };

            const config = mockConfig();
            const token = sign(testPayload, config.jwtSecret, { expiresIn: 10 });

            const res = validateSiteToken(config, `bearer ${token}`);

            expect(res).toEqual(testPayload);
        });
    });
});
