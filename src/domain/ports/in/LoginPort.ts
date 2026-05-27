import { User } from '../../entities/User';

export interface LoginResult {
    token: string;
    user: User;
}

export interface LoginPort {
    execute(username: string): Promise<LoginResult | null>;
}
