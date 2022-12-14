import { User } from '../User';

export interface LoginResponse {
    userData: User;

    /** How long until the current {@link siteToken} expires, in seconds. */
    expiresInSeconds: number;

    /** Signed JWT to send in `Authorization` header for any elevated requests to this API. */
    siteToken: string;

    /** Typeof operation this was generated from. */
    type: 'login' | 'refresh' | 'register';
}
