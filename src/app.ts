import express from 'express';
import swaggerUi from 'swagger-ui-express';
import Config from './config';
import corsMiddleware from './middleware/corsMiddleware';
import rateLimitingMiddleware from './middleware/rateLimitingMiddleware';

import apiSpec from '../openapi.json';
import validatorErrorHandler from './middleware/validatorErrorHandler';
import validatorMiddleware from './middleware/validatorMiddleware';
import mongoose from 'mongoose';

export default async function createApp(config: Config) {
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
    app.use(validatorMiddleware());
    app.use(validatorErrorHandler());

    // setting up routes
    app.get('/', (_req, res) =>
        res.status(200).json({
            startTime: config.startedAt,
            version: config.version,
            receivedRequest: new Date().toISOString(),
        }),
    );

    // connecting to MongoDB
    if (config.mongoURI !== 'test mongo URI') {
        await mongoose.connect(config.mongoURI, { dbName: config.mongoDbName });
        console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
    }

    return app;
}
