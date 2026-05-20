import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../infrastructure/cache/RedisService';

export function cacheMiddleware(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = `cache:http:${req.path}:${JSON.stringify(req.query)}`;
    const cached = await RedisService.get(key);

    if (cached) {
      console.log(`[CACHE HIT]  HTTP key="${key}"`);
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      RedisService.set(key, JSON.stringify(body), ttlSeconds).catch(() => {});
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}
