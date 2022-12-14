import { revokeToken } from '../../helpers';
import { EndpointProvider } from '../../types';

export const logout: EndpointProvider<void, void> = {
    scopes: 'auth',
    applyToRoute: ({ config, auth }) => {
        return async (_req, res) => {
            try {
                await revokeToken(config, auth.access_token);
                res.sendStatus(200);
            } catch (error) {
                res.sendStatus(400);
            }
        };
    },
};
