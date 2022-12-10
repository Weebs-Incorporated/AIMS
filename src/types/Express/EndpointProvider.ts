import { RequestHandler } from 'express';
import { Db } from 'mongodb';
import { Config } from '../../config';
import { ResponseLocals } from './ResponseLocals';

export type EndpointProvider<TRequest, TResponse> = (
    config: Config,
    db?: Db,
) => RequestHandler<object, TResponse, TRequest, object, ResponseLocals>;
