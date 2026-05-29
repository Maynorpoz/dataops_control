import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { SimulateConcurrentLoadUseCase } from '../../application/concurrency/SimulateConcurrentLoadUseCase';
import { ForceDeadlockUseCase } from '../../application/concurrency/ForceDeadlockUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';

const simulate    = new SimulateConcurrentLoadUseCase();
const forceDeadlock = new ForceDeadlockUseCase();

export class ConcurrencyController {
  runSimulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { connectionId, concurrentUsers = 100 } = req.body;
      if (!connectionId) { res.status(400).json({ error: 'connectionId required' }); return; }
      const result = await simulate.execute(parseInt(connectionId), parseInt(concurrentUsers));
      res.json(result);
    } catch (err) { next(err); }
  };

  getLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(
        'SELECT * FROM tx_log ORDER BY created_at DESC LIMIT 200'
      );
      res.json(rows);
    } catch (err) { next(err); }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE lock_type = 'DEADLOCK') AS deadlocks,
          COUNT(*) FILTER (WHERE resolved = TRUE) AS resolved,
          AVG(wait_time) AS avg_wait_ms
        FROM tx_log
      `);
      res.json(rows[0]);
    } catch (err) { next(err); }
  };

  runForceDeadlock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { connectionId } = req.body;
      if (!connectionId) { res.status(400).json({ error: 'connectionId required' }); return; }
      const result = await forceDeadlock.execute(parseInt(connectionId));
      res.json(result);
    } catch (err) { next(err); }
  };
}
