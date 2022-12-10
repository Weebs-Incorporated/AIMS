import { RequestHandler, ErrorRequestHandler } from 'express';
import { Config } from '../../config';

export type MiddlewareProvider = (
    config: Config,
) => RequestHandler | ErrorRequestHandler | RequestHandler[] | ErrorRequestHandler[];
