import { makeAuthorizationLink } from '../../helpers';
import { EndpointProvider } from '../../types';

export const makeLoginLink: EndpointProvider<void, string> = {
    scopes: 'none',
    applyToRoute: ({ config }) => {
        return (_req, res) =>
            res.status(200).send(makeAuthorizationLink(config, `http://localhost:${config.port}/static/discordOAuth2`));
    },
};
