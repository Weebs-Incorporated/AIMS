import express, { Express } from 'express';
import { Config } from '../config';
import { authErrorHandler } from './authErrorHandler';
import { corsMiddleware } from './corsMiddleware';
import { rateLimitingMiddleware } from './rateLimitingMiddleware';
import { validatorErrorHandler } from './validatorErrorHandler';
import { validatorMiddleware } from './validatorMiddleware';

/**
 * Applies all middleware that should be run **before** route-specific handlers.
 *
 * E.g. body parsers, validators, and error handlers for those middlewares.
 */
export function applyPreRouteMiddleware(app: Express, config: Config): void {
    // order is important
    app.use(express.json());
    app.use(corsMiddleware(config));
    app.use(rateLimitingMiddleware(config));
    app.use(validatorMiddleware(config));
    app.use(validatorErrorHandler(config));
}

/**
 * Applies all middleware that should be run **after** route-specific handlers.
 *
 * E.g. error handlers.
 */
export function applyPostRouteMiddleware(app: Express, config: Config): void {
    // order is important
    app.use(authErrorHandler(config));
}
