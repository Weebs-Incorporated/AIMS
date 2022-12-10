import { User } from './User';

export interface ClientFacingUser extends Omit<User, 'latestIp'> {
    latestIp: string | null;
}
