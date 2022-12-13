import { makeAuthorizationLink } from '../../helpers';
import { EndpointProviderNoScopes } from '../../types';

export const makeLoginLink: EndpointProviderNoScopes<void, string> = {
    scopes: 'none',
    applyToRoute: ({ config }) => {
        return (_req, res) =>
            res.status(200).send(makeAuthorizationLink(config, `http://localhost:${config.port}/static/discordOAuth2`));
    },
};
