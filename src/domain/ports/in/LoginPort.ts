import { User } from '../out/UserRepository';

export interface LoginResult {
    token: string;
    user: User;
}

export interface LoginPort {
    execute(username: string): Promise<LoginResult | null>;
}
