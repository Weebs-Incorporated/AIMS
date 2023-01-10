import { User, UserPermissions } from '../types';
import { hasOneOfPermissions, hasPermission } from './userPermissionHelpers';

describe('userPermissionHelpers', () => {
    describe('hasPermission', () => {
        it('works with user objects', () => {
            const user = {
                permissions: UserPermissions.Comment | UserPermissions.Upload | UserPermissions.Owner,
            } as User;

            expect(hasPermission(user, UserPermissions.Audit)).toBe(false);

            expect(hasPermission(user, UserPermissions.Comment)).toBe(true);

            expect(hasPermission(user, UserPermissions.Comment | UserPermissions.Owner)).toBe(true);

            expect(hasPermission(user, UserPermissions.Comment | UserPermissions.Audit)).toBe(false);
        });

        it('works with permissions bitfields', () => {
            const permissions = UserPermissions.Comment | UserPermissions.Upload | UserPermissions.Owner;

            expect(hasPermission(permissions, UserPermissions.Audit)).toBe(false);

            expect(hasPermission(permissions, UserPermissions.Comment)).toBe(true);

            expect(hasPermission(permissions, UserPermissions.Comment | UserPermissions.Owner)).toBe(true);

            expect(hasPermission(permissions, UserPermissions.Comment | UserPermissions.Audit)).toBe(false);
        });
    });

    describe('hasOneOfPermissions', () => {
        it('works with user objects', () => {
            const user = {
                permissions: UserPermissions.Comment | UserPermissions.Upload | UserPermissions.Owner,
            } as User;

            expect(hasOneOfPermissions(user, UserPermissions.Audit)).toBe(false);

            expect(hasOneOfPermissions(user, UserPermissions.Comment)).toBe(true);

            expect(hasOneOfPermissions(user, UserPermissions.Comment, UserPermissions.Audit)).toBe(true);

            expect(hasOneOfPermissions(user, UserPermissions.Audit, UserPermissions.AssignPermissions)).toBe(false);
        });

        it('works with permissions bitfields', () => {
            const permissions = UserPermissions.Comment | UserPermissions.Upload | UserPermissions.Owner;

            expect(hasOneOfPermissions(permissions, UserPermissions.Audit)).toBe(false);

            expect(hasOneOfPermissions(permissions, UserPermissions.Comment)).toBe(true);

            expect(hasOneOfPermissions(permissions, UserPermissions.Comment, UserPermissions.Audit)).toBe(true);

            expect(hasOneOfPermissions(permissions, UserPermissions.Audit, UserPermissions.AssignPermissions)).toBe(
                false,
            );
        });
    });
});
