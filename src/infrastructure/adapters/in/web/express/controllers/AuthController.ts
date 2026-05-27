import { Request, Response } from 'express';
import { UserRepository } from '../../../../../../domain/ports/out/UserRepository';
import jwt from 'jsonwebtoken';

export class AuthController {
  constructor(private readonly userRepository: UserRepository) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.body;

      if (!username) {
        res.status(400).json({ error: 'Username é obrigatório' });
        return;
      }

      const user = await this.userRepository.findByUsername(username);

      if (!user) {
        res.status(401).json({ error: 'Username inválido' });
        return;
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

      res.status(200).json({ token, user });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}
