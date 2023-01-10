import { basename, extname } from 'path';
import { hasOneOfPermissions } from '../../helpers';
import { EndpointProvider, UserPermissions } from '../../types';
import { Post, PostAttributes, PostStatus } from '../../types/Post';

export type MakePostRequest = Partial<Post<PostStatus.InitialAwaitingValidation>> & { url: string };

export type MakePostResponse = string | undefined | { message: string };

export const makePost: EndpointProvider<MakePostRequest, MakePostResponse> = {
    scopes: 'both',
    applyToRoute: ({ db, auth }) => {
        return async (req, res) => {
            const requester = await db.users.findOne({ _id: auth.id });
            if (requester === null) {
                return res.status(401).json({
                    message:
                        'The account associated with your credentials could not be found, it may have been deleted',
                });
            }

            if (
                !hasOneOfPermissions(
                    requester,
                    UserPermissions.Upload,
                    UserPermissions.AssignPermissions,
                    UserPermissions.Owner,
                )
            ) {
                return res.status(403).send('You do not have permission to upload.');
            }

            const fileName = basename(req.body.url).toLowerCase().slice(0, -extname(req.body.url).length);

            const existing = await Promise.all(
                Object.values(db.posts).map((collection) => collection.findOne({ _id: fileName })),
            );

            if (existing.some((e) => e !== null)) {
                return res.sendStatus(409);
            }

            const newPost: Post<PostStatus.InitialAwaitingValidation> = {
                _id: fileName,
                url: req.body.url,
                metaData: {
                    uploaded: new Date().toISOString(),
                    modified: null,
                    uploader: auth.id,
                    modifier: null,
                },
                dimensions: req.body.dimensions ?? {
                    width: -1,
                    height: -1,
                },
                size: req.body.size ?? -1,
                status: PostStatus.InitialAwaitingValidation,
                sources: req.body.sources ?? {},
                accompanyingImages: req.body.accompanyingImages ?? [],
                universe: req.body.universe ?? undefined,
                artistName: req.body.artistName ?? 'Unknown',
                characters: req.body.characters ?? [],
                artStyle: req.body.artStyle ?? PostAttributes.ArtStyle.Standard,
                explicitLevel: req.body.explicitLevel ?? PostAttributes.ExplicitLevel.Low,
                hairLengths: req.body.hairLengths ?? 0,
                lightLevel: req.body.lightLevel ?? PostAttributes.LightLevel.Medium,
                outfits: req.body.outfits ?? 0,
                races: req.body.races ?? 0,
                shotType: req.body.shotType ?? PostAttributes.ShotType.MidShot,
                themes: req.body.themes ?? 0,
                hairColours: req.body.hairColours ?? 0,
                eyeColours: req.body.eyeColours ?? 0,
            };

            await db.posts[PostStatus.InitialAwaitingValidation].insertOne(newPost);

            return res.sendStatus(200);
        };
    },
};
