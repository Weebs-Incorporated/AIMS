import { hasPermission } from '../../helpers/userPermissionHelpers';
import { ClientFacingUser, EndpointProvider, UserPermissions } from '../../types';

export const getUserById: EndpointProvider<void, ClientFacingUser, { id: string }> = {
    scopes: 'db',
    applyToRoute: ({ db, auth }) => {
        return async (req, res) => {
            const { id } = req.params;

            const user = await db.users.findOne({ _id: id });

            if (user === null) return res.sendStatus(404);

            const safeUser: ClientFacingUser = user;

            if (auth === null) safeUser.latestIp = null; // requester not logged in
            else if (auth.id !== safeUser._id) {
                // requester logged in and not requesting self
                const user = await db.users.findOne({ _id: auth.id });

                // requester account deleted, or doesn't have owner permissions
                if (user === null || !hasPermission(user, UserPermissions.Owner)) safeUser.latestIp = null;
            }

            return res.status(200).json(safeUser);
        };
    },
};
