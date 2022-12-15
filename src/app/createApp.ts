import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { join } from 'path';
import apiSpec from '../openapi.json';
import { Config } from '../config';
import { applyRoutes } from '../handlers';
import { applyPostRouteMiddleware, applyPreRouteMiddleware } from '../middleware';
import { AppDatabaseCollections } from '../types';

export function createApp(config: Config, db?: AppDatabaseCollections) {
    const app = express();

    app.set('trust proxy', config.numProxies);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec, { customSiteTitle: 'AIMS API' }));
    app.use('/spec', express.static(join(__dirname, '../', 'openapi.json')));
    app.use('/static', express.static('static', { extensions: ['html'] }));
    app.use('/favicon.ico', express.static('static/favicon.ico'));

    applyPreRouteMiddleware(app, config);

    applyRoutes(app, config, db);

    applyPostRouteMiddleware(app, config);

    return app;
}
