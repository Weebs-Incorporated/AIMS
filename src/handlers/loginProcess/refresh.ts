import { RESTPostOAuth2AccessTokenResult, APIUser } from 'discord-api-types/v10';
import { getUserInfo, makeSiteToken, refreshAccessToken } from '../../helpers';
import { EndpointProvider, LoginResponse } from '../../types';

export const refresh: EndpointProvider<void, LoginResponse | string> = {
    scopes: 'both',
    applyToRoute: ({ config, db, auth }) => {
        return async (req, res) => {
            let newAuth: RESTPostOAuth2AccessTokenResult;
            let discordUser: APIUser | null;

            const user = await db.users.findOne({ _id: auth.id });
            if (user === null) return res.sendStatus(404);

            // refresh Discord OAuth access token
            try {
                newAuth = await refreshAccessToken(config, auth.refresh_token);
            } catch (error) {
                return res.sendStatus(400);
            }

            // get Discord user data
            try {
                const fetchedDiscordUser = await getUserInfo(newAuth.access_token);
                if (fetchedDiscordUser === null) {
                    return res.status(500).send('Generated invalid access token.');
                }
                discordUser = fetchedDiscordUser;
            } catch (error) {
                return res.status(500).send('Failed to get Discord user info.');
            }

            // update current user with fetched Discord user data
            const updatedUser = {
                username: discordUser.username,
                discriminator: discordUser.discriminator,
                avatar: discordUser.avatar,
                latestIp: req.ip,
                lastLoginOrRefresh: new Date().toISOString(),
            };

            // save changes
            db.users.updateOne({ _id: auth.id }, { $set: updatedUser });

            const newToken = makeSiteToken(config, newAuth, auth.id);

            return res.status(200).json({
                userData: { ...user, ...updatedUser },
                refreshToken: newAuth.refresh_token,
                expiresInSeconds: newAuth.expires_in,
                siteToken: newToken,
                type: 'refresh',
            });
        };
    },
};
