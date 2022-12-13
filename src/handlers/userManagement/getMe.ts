import { EndpointProvider, User } from '../../types';

export const getMe: EndpointProvider<void, User | null> = {
    scopes: 'both',
    applyToRoute: ({ db, auth }) => {
        return async (_req, res) => {
            const user = await db.users.findOne({ _id: auth.id });

            if (user === null) res.sendStatus(404);
            else res.status(200).json(user);
        };
    },
};
