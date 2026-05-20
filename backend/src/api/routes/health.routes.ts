import { Router, Request, Response } from 'express';
import { getPool } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const checks: Record<string, string> = { status: 'ok', timestamp: new Date().toISOString() };

  try {
    await getPool().query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    await RedisService.get('health:ping');
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === new Date().toISOString());
  res.status(allOk ? 200 : 503).json(checks);
});

export default router;
