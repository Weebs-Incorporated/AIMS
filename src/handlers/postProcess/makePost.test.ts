import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../app';
import { mockConfig } from '../../config';
import { makeSiteToken } from '../../helpers';
import { createTestDatabase, mockedOAuthResult, mockedUser, TestDatabase } from '../../testing';
import { Post, PostAttributes, PostStatus } from '../../types/Post';
import { User, UserPermissions } from '../../types';

describe('POST /posts', () => {
    const config = mockConfig();
    let app: Express;
    let testDatabase: TestDatabase;

    const users: Record<string, User> = {
        owner: { ...mockedUser, permissions: UserPermissions.Owner, _id: 'owner' },
        uploader: { ...mockedUser, permissions: UserPermissions.Upload, _id: 'uploader' },
        normal: { ...mockedUser, _id: 'normal' },
    };

    const tokens = {
        owner: makeSiteToken(config, mockedOAuthResult, 'owner'),
        uploader: makeSiteToken(config, mockedOAuthResult, 'uploader'),
        normal: makeSiteToken(config, mockedOAuthResult, 'normal'),
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
        await testDatabase.db.posts[PostStatus.InitialAwaitingValidation].deleteMany({});
        await testDatabase.db.posts[PostStatus.Public].deleteMany({});
    });

    it("returns status code 401 when the requester's account is not found", async () => {
        const goneToken = makeSiteToken(config, mockedOAuthResult, 'deleted');

        const res = await request(app).post('/submissions').set('Authorization', `Bearer ${goneToken}`).send({
            url: '',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe(
            'The account associated with your credentials could not be found, it may have been deleted',
        );
    });

    it("doesn't allow normal users to upload", async () => {
        const res = await request(app).post('/submissions').set('Authorization', `Bearer ${tokens.normal}`).send({
            url: '',
        });

        expect(res.statusCode).toBe(403);
    });

    it('returns status code 409 when the file name is already present in the submissions db', async () => {
        await testDatabase.db.posts[PostStatus.InitialAwaitingValidation].insertOne({
            _id: 'somepost',
        } as Post<PostStatus.InitialAwaitingValidation>);

        const res = await request(app).post('/submissions').set('Authorization', `Bearer ${tokens.uploader}`).send({
            url: 'foo/bar/somePost.png',
        });

        expect(res.statusCode).toBe(409);
    });

    it('creates a submission with default values', async () => {
        const res = await request(app).post('/submissions').set('Authorization', `Bearer ${tokens.uploader}`).send({
            url: 'foo/bar/someImage.jpeg',
        });

        expect(res.statusCode).toBe(200);

        const inserted = await testDatabase.db.posts[PostStatus.InitialAwaitingValidation].findOne({
            _id: 'someimage',
        });

        if (inserted === null) fail('should have created a post submission');

        expect(inserted).toMatchObject({
            url: 'foo/bar/someImage.jpeg',
        });
    });

    it('creates a submission with partial values', async () => {
        const partials: Partial<Post<PostStatus.InitialAwaitingValidation>> = {
            _id: 'should get overridden',
            sources: {
                [PostAttributes.Source.Pixiv]: {
                    account: 'foo',
                    post: 'bar',
                },
            },
        };
        const res = await request(app)
            .post('/submissions')
            .set('Authorization', `Bearer ${tokens.uploader}`)
            .send({ url: 'someImage.jpeg', ...partials });

        expect(res.statusCode).toBe(200);

        const inserted = await testDatabase.db.posts[PostStatus.InitialAwaitingValidation].findOne({
            _id: 'someimage',
        });

        if (inserted === null) fail('should have created a post submission');

        expect(inserted).toMatchObject({ ...partials, _id: 'someimage' });
    });
});
