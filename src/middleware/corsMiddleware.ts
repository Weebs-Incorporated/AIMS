import cors from 'cors';
import { Config } from '../config';

export default function corsMiddleware(config: Config) {
    const whitelist = new Set(config.clientUrls);

    return cors({
        origin:
            config.clientUrls.length === 0
                ? '*'
                : (origin, callback) => {
                      // origin is undefined on non-browser requests (e.g. Postman, Insomnia)
                      if (origin === undefined || whitelist.has(origin)) callback(null, true);
                      else callback(new Error('Not allowed by CORS'));
                  },
        exposedHeaders: [
            'RateLimit-Limit',
            'RateLimit-Remaining',
            'RateLimit-Reset',
            'Retry-After',
            'RateLimit-Bypass-Response',
        ],
    });
}
