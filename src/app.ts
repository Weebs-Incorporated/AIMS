import express from 'express';
import Config from './config';
import corsMiddleware from './middleware/corsMiddleware';
import rateLimitingMiddleware from './middleware/rateLimitingMiddleware';

export default function createApp(config: Config) {
    const app = express();

    app.set('trust proxy', config.numProxies);

    // applying middleware
    app.use(express.json());
    app.use(corsMiddleware(config));
    app.use(rateLimitingMiddleware(config));

    // setting up routes
    app.get('/', (_req, res) =>
        res.status(200).json({
            startTime: config.startedAt,
            version: config.version,
            receivedRequest: new Date().toISOString(),
        }),
    );

    return app;
}
