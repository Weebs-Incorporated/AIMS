import request from 'supertest';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { revokeToken, validateSiteToken } from '../../helpers';
import { mockedSiteTokenPayload } from '../../testing';

jest.mock('../../helpers');

const mockedRevokeToken = jest.mocked(revokeToken);
const mockedValidateSiteToken = jest.mocked(validateSiteToken);

describe('GET /logout', () => {
    const config = mockConfig();
    const app = createApp(config);

    mockedValidateSiteToken.mockReturnValue(mockedSiteTokenPayload);

    it('returns status code 400 when token revocation fails', async () => {
        mockedRevokeToken.mockImplementationOnce(() => {
            throw new Error();
        });

        const req = await request(app).get('/logout').set('Authorization', 'Bearer some token').send();

        expect(req.statusCode).toBe(400);
    });

    it('returns status code 200 when token revocation succeeds', async () => {
        const req = await request(app).get('/logout').set('Authorization', 'Bearer some token').send();

        expect(req.statusCode).toBe(200);
    });
});
