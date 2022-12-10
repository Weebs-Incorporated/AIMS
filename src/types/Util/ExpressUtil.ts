import { ErrorRequestHandler, RequestHandler } from 'express';
import { Db } from 'mongodb';
import { Config } from '../../config';

export type EndpointProvider<TRequest, TResponse> = (
    config: Config,
    db?: Db,
) => RequestHandler<void, TResponse, TRequest>;

export type MiddlewareProvider = (
    config: Config,
) => RequestHandler | ErrorRequestHandler | RequestHandler[] | ErrorRequestHandler[];
