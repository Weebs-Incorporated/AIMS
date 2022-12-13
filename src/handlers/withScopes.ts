import { Config } from '../config';
import { validateSiteToken } from '../helpers';
import { AppDatabaseCollections, EndpointProvider, EndpointProviderReturnValue } from '../types';

export function withScopes<T extends EndpointProvider>(
    provider: T,
    config: Config,
    db?: AppDatabaseCollections,
): EndpointProviderReturnValue {
    if (provider.scopes === 'none') return provider.applyToRoute({ config });

    if (provider.scopes === 'db') {
        if (db === undefined) return (_req, res) => res.sendStatus(501);
        return provider.applyToRoute({ config, db });
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
