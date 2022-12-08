import { mockConfig } from '../config';
import { makeAuthorizationLink } from './discordHelpers';

describe('discordHelpers', () => {
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
});
