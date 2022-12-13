import axios from 'axios';
import { mockConfig } from '../config';
import { getAccessToken, getUserInfo, makeAuthorizationLink, refreshAccessToken, revokeToken } from './discordHelpers';

jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('discordHelpers', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('makeAuthorizationLink', () => {
        it('makes a valid link given a client ID', () => {
            const config = mockConfig();

            const link = makeAuthorizationLink(config, 'https://example.com');

            // slice at end to remove the trailing '='
            expect(link).toContain(new URLSearchParams(config.discordClientId).toString().slice(0, -1));
            expect(link).toContain(encodeURIComponent('https://example.com'));
        });

        it('generates random state', () => {
            const link1 = makeAuthorizationLink(mockConfig(), 'https://example.com');
            const link2 = makeAuthorizationLink(mockConfig(), 'https://example.com');

            const state1 = new URLSearchParams(link1).get('state');
            const state2 = new URLSearchParams(link2).get('state');

            expect(state1).not.toBeNull();
            expect(state1).not.toBe(state2);
        });
    });

    describe('getAccessToken', () => {
        it('makes a request to the Discord OAuth endpoint', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: 'test response' });
            const res = await getAccessToken(mockConfig(), 'test auth code', 'test redirect uri');

            expect(res).toBe('test response');

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('refreshAccessToken', () => {
        it('makes a request to the Discord OAuth endpoint', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: 'test response' });
            const res = await refreshAccessToken(mockConfig(), 'test refresh token');

            expect(res).toBe('test response');

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('revokeToken', () => {
        it('makes a request to the Discord OAuth endpoint', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: 'test response' });
            const res = await revokeToken(mockConfig(), 'test access token');

            expect(res).toBeUndefined();

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('getUserInfo', () => {
        it('makes a request to the Discord User endpoint', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: 'test user' });
            const res = await getUserInfo('test access token');

            expect(res).toBe('test user');

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('throws errors on fail', async () => {
            mockedAxios.get.mockImplementationOnce(() => {
                throw new Error('test error');
            });

            try {
                await getUserInfo('test access token');
                fail('should have thrown an error');
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toBe('test error');
                } else fail('should have thrown an Error instance');
            }

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('catches specific Axios errors', async () => {
            mockedAxios.isAxiosError.mockReturnValueOnce(true);
            mockedAxios.get.mockImplementationOnce(() => {
                throw { response: { status: 401 } };
            });

            const res = await getUserInfo('test access token');
            expect(res).toBe(null);

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });
    });
});
