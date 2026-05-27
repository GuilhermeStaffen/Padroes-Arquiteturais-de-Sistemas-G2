import { Request, Response } from 'express';
import { LoginPort } from '../../../../../../domain/ports/in/LoginPort';

export class AuthController {
  constructor(private readonly loginPort: LoginPort) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.body;

      if (!username) {
        res.status(400).json({ error: 'Username é obrigatório' });
        return;
      }

      const result = await this.loginPort.execute(username);

      if (!result) {
        res.status(401).json({ error: 'Username inválido' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}
