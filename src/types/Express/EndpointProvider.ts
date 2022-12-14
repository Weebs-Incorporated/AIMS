import { RequestHandler } from 'express';
import { Collection } from 'mongodb';
import { Config } from '../../config';
import { SiteTokenPayload } from '../../helpers';
import { Post, PostStatus } from '../Post';
import { User } from '../User';
import { ResponseLocals } from './ResponseLocals';

export interface AppDatabaseCollections {
    users: Collection<User>;
    posts: { [K in PostStatus]: Collection<Post<K>> };
}

/** Endpoint handler with typed request body and response types. */
export type EndpointProviderReturnValue<
    TRequest = unknown,
    TResponse = unknown,
    TQueryParams = object,
> = RequestHandler<TQueryParams, TResponse, TRequest, object, ResponseLocals>;

interface EndpointProviderNoScopes<TRequest, TResponse, TQueryParams> {
    scopes: 'none';
    applyToRoute: ({
        config,
        auth,
    }: {
        config: Config;
        auth: SiteTokenPayload | null;
    }) => EndpointProviderReturnValue<TRequest, TResponse, TQueryParams>;
}

interface EndpointProviderDbScope<TRequest, TResponse, TQueryParams> {
    scopes: 'db';
    applyToRoute: ({
        config,
        db,
        auth,
    }: {
        config: Config;
        db: AppDatabaseCollections;
        auth: SiteTokenPayload | null;
    }) => EndpointProviderReturnValue<TRequest, TResponse, TQueryParams>;
}

interface EndpointProviderAuthScope<TRequest, TResponse, TQueryParams> {
    scopes: 'auth';
    applyToRoute: ({
        config,
        auth,
    }: {
        config: Config;
        auth: SiteTokenPayload;
    }) => EndpointProviderReturnValue<TRequest, TResponse, TQueryParams>;
}

export interface EndpointProviderBothScopes<TRequest, TResponse, TQueryParams> {
    scopes: 'both';
    applyToRoute: ({
        config,
        db,
        auth,
    }: {
        config: Config;
        db: AppDatabaseCollections;
        auth: SiteTokenPayload;
    }) => EndpointProviderReturnValue<TRequest, TResponse, TQueryParams>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EndpointProvider<TRequest = any, TResponse = any, TQueryParams = any> =
    | EndpointProviderNoScopes<TRequest, TResponse, TQueryParams>
    | EndpointProviderDbScope<TRequest, TResponse, TQueryParams>
    | EndpointProviderAuthScope<TRequest, TResponse, TQueryParams>
    | EndpointProviderBothScopes<TRequest, TResponse, TQueryParams>;
