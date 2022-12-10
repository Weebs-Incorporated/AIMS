import { RESTPostOAuth2AccessTokenResult, APIUser } from 'discord-api-types/v10';
import { getAccessToken, getUserInfo, makeSiteToken } from '../../helpers';
import { LoginResponse, User, UserPermissions, EndpointProvider } from '../../types';

export const handleLogin: EndpointProvider<{ code: string; redirect_uri: string }, LoginResponse | string> = (
    config,
    db,
) => {
    if (db === undefined) return (_req, res) => res.sendStatus(501);

    const collection = db.collection<User>('users');

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
        const fetchedUser = await collection.findOne({ _id: discordUser.id });
        let userData: User;

        const now = new Date().toISOString();

        /** Information to be applied on login or refresh. */
        const updatedUserInfo = {
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            latestIp: req.ip,
            lastLoginOrRefresh: now,
        };

        if (fetchedUser === null) {
            // no existing user, so is registering
            const newUser: User = {
                ...updatedUserInfo,
                _id: discordUser.id,
                permissions: UserPermissions.Comment,
                registered: now,
                posts: 0,
                comments: 0,
            };
            await collection.insertOne(newUser);
            userData = newUser;
            type = 'register';
        } else {
            // existing user, so is logging in
            await collection.updateOne({ _id: discordUser.id }, { $set: updatedUserInfo });
            userData = { ...fetchedUser, ...updatedUserInfo };
            type = 'login';
        }

        const siteToken = makeSiteToken(config, discordAuth, discordUser.id);

        return res.status(200).json({
            userData,
            refreshToken: discordAuth.refresh_token,
            expiresInSeconds: discordAuth.expires_in,
            siteToken,
            type,
        });
    };
};
