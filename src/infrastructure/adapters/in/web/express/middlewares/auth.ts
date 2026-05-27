import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Informe o token de autenticação' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'secretinho-seguro';
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Forbidden: só admins podem acessar' });
    return;
  }
  next();
};
