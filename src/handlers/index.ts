import { Express } from 'express';
import { Config } from '../config';
import { AppDatabaseCollections } from '../types';
import { makeLoginLink, login, refresh, logout } from './loginProcess';
import { getMe } from './userManagement';
import { withScopes } from './withScopes';

export function applyRoutes(app: Express, config: Config, db?: AppDatabaseCollections): void {
    app.get('/', (_req, res) =>
        res.status(200).json({
            startTime: config.startedAt,
            version: config.version,
            receivedRequest: new Date().toISOString(),
        }),
    );

    app.get('/ip', (req, res) => res.status(200).send(req.ip));

    // login process
    app.get('/makeLoginLink', withScopes(makeLoginLink, config, db));
    app.post('/login', withScopes(login, config, db));
    app.get('/refresh', withScopes(refresh, config, db));
    app.get('/logout', withScopes(logout, config, db));

    app.get('/users/@me', withScopes(getMe, config, db));
}
