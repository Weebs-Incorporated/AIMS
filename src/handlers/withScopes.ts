import { Request } from 'express';
import { Config } from '../config';
import { SiteTokenPayload, validateSiteToken } from '../helpers';
import { AppDatabaseCollections, EndpointProvider, EndpointProviderReturnValue } from '../types';

export function withOptionalAuth(
    config: Config,
    req: Request<unknown, unknown, unknown, unknown>,
): SiteTokenPayload | null {
    const authHeader = req.get('Authorization');
    if (authHeader === undefined) return null;
    return validateSiteToken(config, req.get('Authorization'));
}

export function withScopes<T extends EndpointProvider>(
    provider: T,
    config: Config,
    db?: AppDatabaseCollections,
): EndpointProviderReturnValue {
    if (provider.scopes === 'none')
        return (req, res, next) => {
            const auth = withOptionalAuth(config, req);
            return provider.applyToRoute({ config, auth })(req, res, next);
        };

    if (provider.scopes === 'db') {
        if (db === undefined) return (_req, res) => res.sendStatus(501);
        return (req, res, next) => {
            const auth = withOptionalAuth(config, req);
            return provider.applyToRoute({ config, db, auth })(req, res, next);
        };
    }

    if (provider.scopes === 'auth') {
        return (req, res, next) => {
            const auth = validateSiteToken(config, req.get('Authorization'));
            provider.applyToRoute({ config, auth })(req, res, next);
        };
    }

    if (db === undefined) return (_req, res) => res.sendStatus(501);

    return (req, res, next) => {
        const auth = validateSiteToken(config, req.get('Authorization'));
        provider.applyToRoute({ config, auth, db })(req, res, next);
    };
}
