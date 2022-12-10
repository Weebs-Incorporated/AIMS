import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { Db } from 'mongodb';
import apiSpec from '../../openapi.json';
import { Config } from '../config';
import { getMe, handleLogin, makeLoginLink } from '../handlers';
import {
    corsMiddleware,
    rateLimitingMiddleware,
    validatorMiddleware,
    validatorErrorHandler,
    authErrorHandler,
} from '../middleware';

export function createApp(config: Config, db?: Db) {
    const app = express();

    app.set('trust proxy', config.numProxies);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec, { customSiteTitle: 'AIMS API' }));
    app.use('/spec', express.static('openapi.json'));
    app.use('/static', express.static('static', { extensions: ['html'] }));
    app.use('/favicon.ico', express.static('static/favicon.ico'));

    // applying middleware (order is important)
    app.use(express.json());
    app.use(corsMiddleware(config));
    app.use(rateLimitingMiddleware(config));
    app.use(validatorMiddleware(config));
    app.use(validatorErrorHandler(config));

    // setting up routes
    app.get('/', (_req, res) =>
        res.status(200).json({
            startTime: config.startedAt,
            version: config.version,
            receivedRequest: new Date().toISOString(),
        }),
    );

    app.post('/login', handleLogin(config, db));
    app.get('/makeLoginLink', makeLoginLink(config, db));

    app.get('/users/@me', getMe(config, db));

    app.use(authErrorHandler(config));

    return app;
}
