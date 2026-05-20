import jwt from 'jsonwebtoken';
import { RedisService } from '../../infrastructure/cache/RedisService';

export class LogoutUseCase {
  async execute(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded?.exp ? decoded.exp - now : 900;
      if (ttl > 0) {
        await RedisService.addToBlacklist(token, ttl);
      }
    } catch {
      // Token already expired — no need to blacklist
    }
  }
}
