import { Filter } from 'mongodb';
import { hasPermission } from '../../helpers/userPermissionHelpers';
import { ClientFacingUser, EndpointProvider, User, UserPermissions } from '../../types';
import { PaginationInput, PaginationResponse } from '../../types/Pagination';

export interface GetAllUsersRequest {
    pagination: PaginationInput;
    withIds: string[] | null;
}

export interface GetAllUsersResponse {
    users: ClientFacingUser[];
    pagination: PaginationResponse;
}

export const getAllUsers: EndpointProvider<GetAllUsersRequest, GetAllUsersResponse> = {
    scopes: 'db',
    applyToRoute: ({ db, auth }) => {
        return async (req, res) => {
            const {
                pagination: { page, perPage },
                withIds,
            } = req.body;

            let hideIps = true;
            if (auth !== null) {
                const requester = await db.users.findOne({ _id: auth.id });
                if (requester !== null && hasPermission(requester, UserPermissions.Owner)) hideIps = false;
            }

            const filter: Filter<User> = withIds ? { _id: { $in: withIds } } : {};

            const [numUsers, users] = await Promise.all([
                db.users.countDocuments(filter),
                db.users.find<ClientFacingUser>(filter, { skip: page * perPage, limit: perPage }).toArray(),
            ]);

            if (hideIps) {
                users.forEach((e) => (e.latestIp = null));
            }

            res.status(200).json({ users, pagination: { itemCount: numUsers } });
        };
    },
};
