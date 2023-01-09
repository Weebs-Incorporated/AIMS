import { hasPermission } from '../../helpers/userPermissionHelpers';
import { EndpointProvider, UserPermissions } from '../../types';

export type ModifyUserPermissionsRequest = {
    newPermissions: UserPermissions;
};

export type ModifyUserPermissionsResponse =
    | {
          message: string;
      }
    | string;

export const modifyUserPermissions: EndpointProvider<
    ModifyUserPermissionsRequest,
    ModifyUserPermissionsResponse,
    { id: string }
> = {
    scopes: 'both',
    applyToRoute: ({ db, auth }) => {
        return async (req, res) => {
            const { newPermissions } = req.body;
            const { id } = req.params;

            const [requester, targetUser] = await Promise.all([
                db.users.findOne({ _id: auth.id }),
                db.users.findOne({ _id: id }),
            ]);

            if (requester === null)
                return res.status(401).json({
                    message:
                        'The account associated with your credentials could not be found, it may have been deleted',
                });

            if (targetUser === null) return res.sendStatus(404);

            if (hasPermission(requester, UserPermissions.Owner)) {
                // if the requester is the site owner, they can do anything besides...

                // removing the owner permission from themselves
                if (requester._id === targetUser._id && !hasPermission(newPermissions, UserPermissions.Owner)) {
                    return res.status(403).send('Cannot remove the owner permission from yourself.');
                }

                // modifying another owner's permissions
                if (requester._id !== targetUser._id && hasPermission(targetUser, UserPermissions.Owner)) {
                    return res.status(403).send('This user is also an owner, so you cannot modify their permissions.');
                }

                // making someone else an owner
                if (requester._id !== targetUser._id && hasPermission(newPermissions, UserPermissions.Owner)) {
                    return res.status(403).send('Cannot give out the owner permission.');
                }

                if (targetUser.permissions === newPermissions) return res.sendStatus(204);

                await db.users.updateOne({ _id: targetUser._id }, { $set: { permissions: newPermissions } });
                return res.sendStatus(200);
            }

            if (!hasPermission(requester, UserPermissions.AssignPermissions)) {
                // this user isn't authorized to modify permissions
                // note this comes after the owner check since owners shouldn't need AssignPermissions
                return res.status(403).send('You do not have permission to modify users.');
            }

            // at this stage, we know the requester has AssignPermissions but not Owner

            // no matter who they target, they cannot give out the owner permission
            if (hasPermission(newPermissions, UserPermissions.Owner)) {
                return res.status(403).send('Cannot give out the owner permission.');
            }

            if (requester._id === targetUser._id) {
                // when modifying their own permissions, they can do anything besides...

                // removing AssignPermissions from themselves
                if (!hasPermission(newPermissions, UserPermissions.AssignPermissions)) {
                    return res.status(403).send('Cannot remove the assign permission from yourself.');
                }
            } else {
                // when modifying other user's permissions, they can do anything besides...

                // modifying the permissions of an owner
                if (hasPermission(targetUser, UserPermissions.Owner)) {
                    return res.status(403).send('This user is an owner, so you cannot modify their permissions.');
                }

                // modifying the permissions of someone with AssignPermissions
                if (hasPermission(targetUser, UserPermissions.AssignPermissions)) {
                    return res
                        .status(403)
                        .send('This user can also assign permissions, so you cannot modify their permissions.');
                }

                // give out the AssignPermissions permission
                if (hasPermission(newPermissions, UserPermissions.AssignPermissions)) {
                    return res.status(403).send('Cannot give out the assign permission.');
                }
            }

            // all authorization checks have passed
            if (targetUser.permissions === newPermissions) return res.sendStatus(204);

            await db.users.updateOne({ _id: targetUser._id }, { $set: { permissions: newPermissions } });

            return res.sendStatus(200);
        };
    },
};
