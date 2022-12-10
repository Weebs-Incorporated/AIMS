import { User } from '../User';

export interface LoginResponse {
    userData: User;

    /** Token to use for extending this user's current session. */
    refreshToken: string;

    /** How long until the current {@link siteToken} expires, in seconds. */
    expiresInSeconds: number;

    /** Signed JWT to send in `Authorization` header for any elevated requests to this API. */
    siteToken: string;

    /** Typeof operation this was generated from. */
    type: 'login' | 'refresh' | 'register';
}
