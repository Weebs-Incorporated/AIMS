import { JsonWebTokenError, sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { mockConfig } from '../config';
import { mockedOAuthResult } from '../testing';
import { makeSiteToken, SiteAuthError, SiteTokenPayload, validateSiteToken } from './siteTokenHelpers';

describe('siteTokenHelpers', () => {
    const config = mockConfig();
    describe('makeSiteToken', () => {
        it('signs the payload correctly', () => {
            const token = makeSiteToken(config, mockedOAuthResult, 'test id');

            expect(verify(token, config.jwtSecret)).toMatchObject({
                id: 'test id',
                refresh_token: mockedOAuthResult.refresh_token,
            });
        });
    });

    describe('validateSiteToken', () => {
        it('throws if token is missing', () => {
            try {
                validateSiteToken(config, undefined);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toBe('Missing authorization header');
                } else fail('should have thrown a SiteAuth error');
            }
        });

        it('throws if token is malformed', () => {
            const token = 'garbage token';
            try {
                validateSiteToken(config, token);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof JsonWebTokenError) {
                    expect(error.message).toBe('jwt malformed');
                } else fail('should have thrown a JsonWebTokenError');
            }
        });

        it('throws if token is signed with a different secret', () => {
            const token = sign({}, config.jwtSecret);

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
            const tokenString = sign('string payload', config.jwtSecret);

            try {
                validateSiteToken(config, tokenString);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toContain('Token has invalid payload type');
                } else fail('should have thrown a SiteAuthError');
            }
        });

        it('throws if token lacks an expiration date', () => {
            const tokenString = sign({}, config.jwtSecret);

            try {
                validateSiteToken(config, tokenString);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toContain('Token lacks an expiration date');
                } else fail('should have thrown a SiteAuthError');
            }
        });

        it('throws if token is expired', () => {
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
            // no ID
            const tokenA = sign({}, config.jwtSecret, { expiresIn: 10 });

            // no access token
            const tokenB = sign({ id: 'test id' }, config.jwtSecret, { expiresIn: 10 });

            // no refresh token
            const tokenC = sign({ id: 'test id', access_token: 'test access token' }, config.jwtSecret, {
                expiresIn: 10,
            });

            try {
                validateSiteToken(config, tokenA);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toBe('No ID in payload');
                } else fail('should have thrown a SiteAuthError');
            }

            try {
                validateSiteToken(config, tokenB);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toBe('No access_token in payload');
                } else fail('should have thrown a SiteAuthError');
            }

            try {
                validateSiteToken(config, tokenC);
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof SiteAuthError) {
                    expect(error.message).toBe('No refresh_token in payload');
                } else fail('should have thrown a SiteAuthError');
            }
        });

        it('returns expected object for a valid token', () => {
            const testPayload: SiteTokenPayload = {
                id: 'test id',
                access_token: 'test access token',
                refresh_token: 'test refresh token',
            };

            const token = sign(testPayload, config.jwtSecret, { expiresIn: 10 });

            const res = validateSiteToken(config, token);

            expect(res).toEqual(testPayload);
        });

        it('removes leading "bearer " if present', () => {
            const testPayload: SiteTokenPayload = {
                id: 'test id',
                access_token: 'test access token',
                refresh_token: 'test refresh token',
            };

            const token = sign(testPayload, config.jwtSecret, { expiresIn: 10 });

            const res = validateSiteToken(config, `bearer ${token}`);

            expect(res).toEqual(testPayload);
        });
    });
});
