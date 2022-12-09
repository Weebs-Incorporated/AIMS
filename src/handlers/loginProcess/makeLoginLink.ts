import { RequestHandler } from 'express';
import { Config } from '../../config';
import { makeAuthorizationLink } from '../../helpers';

export function makeLoginLink(config: Config): RequestHandler {
    return (_req, res) =>
        res.status(200).send(makeAuthorizationLink(config, `http://localhost:${config.port}/static/discordOAuth2`));
}
