import { makeAuthorizationLink } from '../../helpers';
import { EndpointProvider } from '../../types';

export const makeLoginLink: EndpointProvider<void, string> = (config) => {
    return (_req, res) =>
        res.status(200).send(makeAuthorizationLink(config, `http://localhost:${config.port}/static/discordOAuth2`));
};
