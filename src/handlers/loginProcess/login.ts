import { RESTPostOAuth2AccessTokenResult, APIUser } from 'discord-api-types/v10';
import { getAccessToken, getUserInfo, makeSiteToken } from '../../helpers';
import { LoginResponse, UserPermissions, EndpointProvider } from '../../types';

export const login: EndpointProvider<{ code: string; redirect_uri: string }, LoginResponse | string> = {
    scopes: 'db',
    applyToRoute: ({ config, db }) => {
        return async (req, res) => {
            const { code, redirect_uri } = req.body;

            let discordAuth: RESTPostOAuth2AccessTokenResult;
            let discordUser: APIUser;
            let type: 'login' | 'register';

            // get Discord access token from code given
            try {
                discordAuth = await getAccessToken(config, code, redirect_uri);
            } catch (error) {
                return res.status(400).send('Invalid code or redirect URI.');
            }

            // get Discord user data using access token
            try {
                const fetchedDiscordUser = await getUserInfo(discordAuth.access_token);
                if (fetchedDiscordUser === null) {
                    return res.status(500).send('Generated invalid access token.');
                }
                discordUser = fetchedDiscordUser;
            } catch (error) {
                return res.status(500).send('Failed to get Discord user info.');
            }

            // see if this user already exists in our database
            let userData = await db.users.findOne({ _id: discordUser.id });

            const now = new Date().toISOString();

            /** On both login or refresh, we should update/apply this information for the user. */
            const updatedUserInfo = {
                username: discordUser.username,
                discriminator: discordUser.discriminator,
                avatar: discordUser.avatar,
                latestIp: req.ip,
                lastLoginOrRefresh: now,
            };

            if (userData === null) {
                // no existing user, so is registering
                userData = {
                    ...updatedUserInfo,
                    _id: discordUser.id,
                    permissions: UserPermissions.Comment,
                    registered: now,
                    posts: 0,
                    comments: 0,
                };
                await db.users.insertOne(userData);
                type = 'register';
            } else {
                // existing user, so is logging in
                await db.users.updateOne({ _id: userData._id }, { $set: updatedUserInfo });
                userData = { ...userData, ...updatedUserInfo };
                type = 'login';
            }

            const siteToken = makeSiteToken(config, discordAuth, discordUser.id);

            return res.status(200).json({
                userData,
                expiresInSeconds: discordAuth.expires_in,
                siteToken,
                type,
            });
        };
    },
};
