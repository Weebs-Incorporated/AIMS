import request from 'supertest';
import { Express } from 'express';
import { mockConfig } from '../../config';
import { createTestDatabase, mockedOAuthResult, mockedUser, TestDatabase } from '../../testing';
import { User, UserPermissions } from '../../types';
import { createApp } from '../../app';
import { makeSiteToken } from '../../helpers';

describe('PATCH /users/:id', () => {
    const config = mockConfig();
    let app: Express;
    let testDatabase: TestDatabase;

    const users: Record<'normal' | 'assigner' | 'assigner2' | 'owner' | 'owner2', User> = {
        normal: { ...mockedUser, _id: 'normal' },
        assigner: { ...mockedUser, _id: 'assigner' },
        assigner2: { ...mockedUser, _id: 'assigner2' },
        owner: { ...mockedUser, _id: 'owner' },
        owner2: { ...mockedUser, _id: 'owner2' },
    };

    const tokens: Record<'normal' | 'assigner' | 'owner', string> = {
        normal: makeSiteToken(config, mockedOAuthResult, 'normal'),
        assigner: makeSiteToken(config, mockedOAuthResult, 'assigner'),
        owner: makeSiteToken(config, mockedOAuthResult, 'owner'),
    };

    beforeAll(async () => {
        testDatabase = await createTestDatabase();
        app = createApp(config, testDatabase.db);

        await testDatabase.db.users.insertMany(Object.values(users));
    });

    afterAll(async () => {
        await testDatabase.shutdown();
    });

    beforeEach(async () => {
        await Promise.all([
            testDatabase.db.users.updateOne({ _id: 'normal' }, { $set: { permissions: UserPermissions.Comment } }),
            testDatabase.db.users.updateOne(
                { _id: 'assigner' },
                { $set: { permissions: UserPermissions.AssignPermissions } },
            ),
            testDatabase.db.users.updateOne(
                { _id: 'assigner2' },
                { $set: { permissions: UserPermissions.AssignPermissions } },
            ),
            testDatabase.db.users.updateOne({ _id: 'owner' }, { $set: { permissions: UserPermissions.Owner } }),
            testDatabase.db.users.updateOne({ _id: 'owner2' }, { $set: { permissions: UserPermissions.Owner } }),
        ]);
    });

    it("returns status code 401 when the requester's account is not found", async () => {
        const goneToken = makeSiteToken(config, mockedOAuthResult, 'deleted');

        const res = await request(app).patch('/users/normal').set('Authorization', `Bearer ${goneToken}`).send({
            newPermissions: UserPermissions.None,
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe(
            'The account associated with your credentials could not be found, it may have been deleted',
        );
    });

    it('returns status code 404 when no target user could be found', async () => {
        const res = await request(app).patch('/users/deleted').set('Authorization', `Bearer ${tokens.normal}`).send({
            newPermissions: UserPermissions.None,
        });

        expect(res.statusCode).toBe(404);
    });

    describe('owner actions', () => {
        it('prevents removing owner from self', async () => {
            const res = await request(app).patch('/users/owner').set('Authorization', `Bearer ${tokens.owner}`).send({
                newPermissions: UserPermissions.AssignPermissions,
            });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Cannot remove the owner permission from yourself.');
        });

        it('prevents modification of other owners', async () => {
            const res = await request(app).patch('/users/owner2').set('Authorization', `Bearer ${tokens.owner}`).send({
                newPermissions: UserPermissions.AssignPermissions,
            });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('This user is also an owner, so you cannot modify their permissions.');
        });

        it('prevents giving owner to other users', async () => {
            const res = await request(app).patch('/users/normal').set('Authorization', `Bearer ${tokens.owner}`).send({
                newPermissions: UserPermissions.Owner,
            });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Cannot give out the owner permission.');
        });

        it('allows modification of normal users', async () => {
            const res = await request(app)
                .patch('/users/normal')
                .set('Authorization', `Bearer ${tokens.owner}`)
                .send({
                    newPermissions: UserPermissions.AssignPermissions | UserPermissions.Upload,
                });

            expect(res.statusCode).toBe(200);

            const newNormal = (await testDatabase.db.users.findOne({ _id: 'normal' }))!;
            expect(newNormal.permissions).toBe(UserPermissions.AssignPermissions | UserPermissions.Upload);
        });

        it('allows modification of assigner users', async () => {
            const res = await request(app)
                .patch('/users/assigner')
                .set('Authorization', `Bearer ${tokens.owner}`)
                .send({
                    newPermissions: UserPermissions.Upload,
                });

            expect(res.statusCode).toBe(200);

            const newNormal = (await testDatabase.db.users.findOne({ _id: 'assigner' }))!;
            expect(newNormal.permissions).toBe(UserPermissions.Upload);
        });

        it('returns status code 204 when no modification is needed', async () => {
            const res = await request(app).patch('/users/normal').set('Authorization', `Bearer ${tokens.owner}`).send({
                newPermissions: UserPermissions.Comment,
            });

            expect(res.statusCode).toBe(204);
        });
    });

    describe('assigner actions', () => {
        it('prevents removing assign from self', async () => {
            const res = await request(app)
                .patch('/users/assigner')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.Comment,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Cannot remove the assign permission from yourself.');
        });

        it('prevents modification of other assigners', async () => {
            const res = await request(app)
                .patch('/users/assigner2')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.Comment,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('This user can also assign permissions, so you cannot modify their permissions.');
        });

        it('prevents modification of owners', async () => {
            const res = await request(app)
                .patch('/users/owner')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.AssignPermissions,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('This user is an owner, so you cannot modify their permissions.');
        });

        it('prevents giving assign to other users', async () => {
            const res = await request(app)
                .patch('/users/normal')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.AssignPermissions,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Cannot give out the assign permission.');
        });

        it('prevents giving owner to other users', async () => {
            const res = await request(app)
                .patch('/users/normal')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.Owner,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Cannot give out the owner permission.');
        });

        it('allows modification of normal users', async () => {
            const res = await request(app)
                .patch('/users/normal')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.Audit | UserPermissions.Upload,
                });

            expect(res.statusCode).toBe(200);

            const newNormal = (await testDatabase.db.users.findOne({ _id: 'normal' }))!;
            expect(newNormal.permissions).toBe(UserPermissions.Audit | UserPermissions.Upload);
        });

        it('returns status code 204 when no modification is needed', async () => {
            const res = await request(app)
                .patch('/users/normal')
                .set('Authorization', `Bearer ${tokens.assigner}`)
                .send({
                    newPermissions: UserPermissions.Comment,
                });

            expect(res.statusCode).toBe(204);
        });
    });

    describe('normal actions', () => {
        it('prevents any modification', async () => {
            const res = await request(app)
                .patch('/users/assigner')
                .set('Authorization', `Bearer ${tokens.normal}`)
                .send({
                    newPermissions: UserPermissions.Audit,
                });

            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('You do not have permission to modify users.');
        });
    });
});
