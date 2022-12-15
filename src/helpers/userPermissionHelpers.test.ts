import { User, UserPermissions } from '../types';
import { hasPermission } from './userPermissionHelpers';

describe('userPermissionHelpers', () => {
    describe('hasPermission', () => {
        it('returns some expected values', () => {
            const user = {
                permissions: UserPermissions.Comment | UserPermissions.Upload | UserPermissions.Owner,
            } as User;

            expect(hasPermission(user, UserPermissions.Audit)).toBe(false);

            expect(hasPermission(user, UserPermissions.Comment)).toBe(true);

            expect(hasPermission(user, UserPermissions.Comment | UserPermissions.Owner)).toBe(true);

            expect(hasPermission(user, UserPermissions.Comment | UserPermissions.Audit)).toBe(false);
        });
    });
});
