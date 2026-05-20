import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GetDashboardMetricsUseCase } from '../../application/metrics/GetDashboardMetricsUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

const dashboard = new GetDashboardMetricsUseCase();

export class MetricsController {
  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await dashboard.execute());
    } catch (err) { next(err); }
  };

  getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { dbId } = req.params;
      const { limit = '50' } = req.query as any;
      const data = await RedisService.getCached(`cache:metrics:history:${dbId}:${limit}`, () =>
        query(
          'SELECT * FROM db_metrics WHERE db_id=$1 ORDER BY capture_time DESC LIMIT $2',
          [dbId, parseInt(limit)]
        ), 30
      );
      res.json(data);
    } catch (err) { next(err); }
  };
}
