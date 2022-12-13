import { RequestHandler } from 'express';
import { Collection } from 'mongodb';
import { Config } from '../../config';
import { SiteTokenPayload } from '../../helpers';
import { User } from '../User';
import { ResponseLocals } from './ResponseLocals';

export interface AppDatabaseCollections {
    users: Collection<User>;
}

/** Endpoint handler with typed request body and response types. */
export type EndpointProviderReturnValue<TRequest = unknown, TResponse = unknown> = RequestHandler<
    object,
    TResponse,
    TRequest,
    object,
    ResponseLocals
>;

export interface EndpointProviderNoScopes<TRequest, TResponse> {
    scopes: 'none';
    applyToRoute: ({ config }: { config: Config }) => EndpointProviderReturnValue<TRequest, TResponse>;
}

export interface EndpointProviderDbScope<TRequest, TResponse> {
    scopes: 'db';
    applyToRoute: ({
        config,
        db,
    }: {
        config: Config;
        db: AppDatabaseCollections;
    }) => EndpointProviderReturnValue<TRequest, TResponse>;
}

export interface EndpointProviderAuthScope<TRequest, TResponse> {
    scopes: 'auth';
    applyToRoute: ({
        config,
        auth,
    }: {
        config: Config;
        auth: SiteTokenPayload;
    }) => EndpointProviderReturnValue<TRequest, TResponse>;
}

export interface EndpointProviderBothScopes<TRequest, TResponse> {
    scopes: 'both';
    applyToRoute: ({
        config,
        db,
        auth,
    }: {
        config: Config;
        db: AppDatabaseCollections;
        auth: SiteTokenPayload;
    }) => EndpointProviderReturnValue<TRequest, TResponse>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EndpointProvider<TRequest = any, TResponse = any> =
    | EndpointProviderNoScopes<TRequest, TResponse>
    | EndpointProviderDbScope<TRequest, TResponse>
    | EndpointProviderAuthScope<TRequest, TResponse>
    | EndpointProviderBothScopes<TRequest, TResponse>;
