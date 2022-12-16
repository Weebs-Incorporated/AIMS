import { ClientFacingUser, User, UserPermissions } from '../types';

/**
 * Checks the provided set of permissions includes the target one.
 * @param {User | ClientFacingUser | UserPermissions} permissionSet Object to check permissions of.
 * @param {UserPermissions} targetPermissions Permissions that are required.
 *
 * To check multiple permissions, simply bitwise OR them.
 *
 * @example
 * ```ts
 * const myUser = { permissions: 28 } as User;
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Comment) // true
 * hasPermission(myUser, UserPermissions.Owner | UserPermissions.Audit) // false
 *
 * // also works with the bitfield directly
 * hasPermission(28, UserPermissions.Owner | UserPermissions.Comment) // true
 * hasPermission(28, UserPermissions.Owner | UserPermissions.Audit) // false
 * ```
 */
export function hasPermission(
    permissionSet: User | ClientFacingUser | UserPermissions,
    targetPermissions: UserPermissions,
): boolean {
    if (typeof permissionSet === 'number') {
        return (permissionSet & targetPermissions) === targetPermissions;
    }
    return (permissionSet.permissions & targetPermissions) === targetPermissions;
}
