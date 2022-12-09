import { RESTPostOAuth2AccessTokenResult, APIUser } from 'discord-api-types/v10';
import { Config } from '../../config';
import { getAccessToken, getUserInfo, makeSiteToken } from '../../helpers';
import { UserModel } from '../../models';
import { TypedRequestHandler, LoginResponse, User, UserPermissions } from '../../types';

export function handleLogin(
    config: Config,
): TypedRequestHandler<{ code: string; redirect_uri: string }, LoginResponse | string> {
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

        // get Discord user data
        try {
            const fetchedDiscordUser = await getUserInfo(discordAuth.access_token);
            if (fetchedDiscordUser === null) {
                return res.status(500).send('Generated invalid access token.');
            }
            discordUser = fetchedDiscordUser;
        } catch (error) {
            return res.status(500).send('Failed to get Discord user info.');
        }

        // get existing user if present
        let siteUser = await UserModel.findById<User>(discordUser.id);

        const now = new Date().toISOString();

        /** Information to be applied on login or refresh. */
        const baseUserInfo = {
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            latestIp: req.ip,
            lastLoginOrRefresh: now,
        };

        if (siteUser === null) {
            // no existing user, so is registering
            const newUser: User = {
                ...baseUserInfo,
                _id: discordUser.id,
                permissions: UserPermissions.Comment,
                registered: now,
                posts: 0,
                comments: 0,
            };
            await UserModel.create(newUser);
            siteUser = newUser;
            type = 'register';
        } else {
            // existing user, so is logging in
            const updatedUser: User = {
                ...siteUser,
                ...baseUserInfo,
            };
            await UserModel.findByIdAndUpdate(discordUser.id, updatedUser);
            siteUser = updatedUser;
            type = 'login';
        }

        const siteToken = makeSiteToken(config, discordAuth, discordUser.id);

        return res.status(200).json({
            id: discordUser.id,
            refreshToken: discordAuth.refresh_token,
            expiresInSeconds: discordAuth.expires_in,
            siteToken,
            type,
        });
    };
}
