import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RedisService } from '../../infrastructure/cache/RedisService';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const authMiddleware = async (
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente o mal formado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const isBlacklisted = await RedisService.get(`blacklist:${token}`);
  if (isBlacklisted) {
    res.status(401).json({ error: 'Token invalidado (sesión cerrada)' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
