import { validateSiteToken } from '../../helpers';
import { EndpointProvider, User } from '../../types';

export const getMe: EndpointProvider<void, User | null> = (config, db) => {
    if (db === undefined) return (_req, res) => res.sendStatus(501);

    const collection = db.collection<User>('users');

    return async (req, res, next) => {
        try {
            const auth = validateSiteToken(config, req.get('Authorization'));

            const user = await collection.findOne({ _id: auth.id });

            if (user === null) res.sendStatus(404);
            else res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };
};
