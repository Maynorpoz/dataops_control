import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { MeasureReplicationLagUseCase } from '../../application/replication/MeasureReplicationLagUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

const measureLag = new MeasureReplicationLagUseCase();

export class ReplicationController {
  getStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await RedisService.getCached('cache:replication:status', () =>
        query('SELECT * FROM replication_lag ORDER BY measured_at DESC LIMIT 1'),
        30
      );
      res.json(data[0] || { message: 'No replication data yet' });
    } catch (err) { next(err); }
  };

  getLagHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(
        'SELECT * FROM replication_lag ORDER BY measured_at DESC LIMIT 100'
      );
      res.json(rows);
    } catch (err) { next(err); }
  };

  stressScenario = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const scenario = req.params.scenario as 'NORMAL_LOAD' | 'MEDIUM_LOAD' | 'HIGH_LOAD';
      if (!['NORMAL_LOAD','MEDIUM_LOAD','HIGH_LOAD'].includes(scenario)) {
        res.status(400).json({ error: 'scenario must be NORMAL_LOAD, MEDIUM_LOAD, or HIGH_LOAD' }); return;
      }
      const result = await measureLag.execute(scenario);
      res.json(result);
    } catch (err) { next(err); }
  };
}
