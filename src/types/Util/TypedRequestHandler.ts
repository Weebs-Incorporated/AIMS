import { RequestHandler } from 'express';

export type TypedRequestHandler<TRequest, TResponse> = RequestHandler<void, TResponse, TRequest>;
