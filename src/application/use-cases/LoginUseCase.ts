import { LoginPort, LoginResult } from '../../domain/ports/in/LoginPort';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import jwt from 'jsonwebtoken';

export class LoginUseCase implements LoginPort {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(username: string): Promise<LoginResult | null> {
        const user = await this.userRepository.findByUsername(username);
        
        if (!user) {
            return null;
        }

        const secret = process.env.JWT_SECRET || 'secretinho-seguro';
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '24h' }
        );

        return { token, user };
    }
}
