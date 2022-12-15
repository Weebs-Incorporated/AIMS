import { ClientFacingUser, User, UserPermissions } from '../types';

/**
 * Checks the provided set of permissions includes the target one.
 * @param {User | ClientFacingUser} user User to check permissions of.
 * @param {UserPermissions} targetPermissions Permissions that are required.
 *
 * To check multiple permissions, simply bitwise OR them.
 *
 * @example
 * ```ts
 * const myUser = { permissions: 28 } as User;
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Comment) // true
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Audit) // false
 * ```
 */
export function hasPermission(user: User | ClientFacingUser, targetPermissions: UserPermissions): boolean {
    return (user.permissions & targetPermissions) === targetPermissions;
}
