import { hasPermission } from '../../helpers/userPermissionHelpers';
import { ClientFacingUser, EndpointProvider, UserPermissions } from '../../types';

export const getUserById: EndpointProvider<void, ClientFacingUser, { id: string }> = {
    scopes: 'db',
    applyToRoute: ({ db, auth }) => {
        return async (req, res) => {
            const { id } = req.params;

            const user = await db.users.findOne<ClientFacingUser>({ _id: id });

            if (user === null) return res.sendStatus(404);

            if (auth === null) user.latestIp = null; // requester not logged in
            else if (auth.id !== user._id) {
                // requester logged in and not requesting self

                const requester = await db.users.findOne({ _id: auth.id });

                // requester account deleted, or doesn't have owner permissions
                if (requester === null || !hasPermission(requester, UserPermissions.Owner)) user.latestIp = null;
            }

            return res.status(200).json(user);
        };
    },
};
