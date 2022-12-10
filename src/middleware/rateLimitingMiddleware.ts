import rateLimit from 'express-rate-limit';
import { Config } from '../config';
import { MiddlewareProvider } from '../types';

export const rateLimitingMiddleware: MiddlewareProvider = (config: Config) => {
    const bypassTokens = new Set(config.rateLimitBypassTokens);

    return rateLimit({
        windowMs: 60 * 1000,
        max: config.maxRequestsPerMinute,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req, res) => {
            const token = req.get('RateLimit-Bypass-Token');
            if (token === undefined) return false;

            if (!bypassTokens.has(token)) {
                res.setHeader('RateLimit-Bypass-Response', 'Invalid');
                return false;
            }

            res.setHeader('RateLimit-Bypass-Response', 'Valid');
            return true;
        },
    });
};
