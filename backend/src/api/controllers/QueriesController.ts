import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CaptureSlowQueryUseCase } from '../../application/queries/CaptureSlowQueryUseCase';
import { GetQueryLogsUseCase } from '../../application/queries/GetQueryLogsUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';

const capture = new CaptureSlowQueryUseCase();
const logs = new GetQueryLogsUseCase();

export class QueriesController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page = '1', pageSize = '20', classification } = req.query as any;
      res.json(await logs.getAll(parseInt(page), parseInt(pageSize), classification));
    } catch (err) { next(err); }
  };

  getTopSlow = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string || '10');
      res.json(await logs.getTopSlow(limit));
    } catch (err) { next(err); }
  };

  captureFromDb = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const count = await capture.execute(parseInt(req.params.dbId));
      res.json({ captured: count });
    } catch (err) { next(err); }
  };

  getPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query('SELECT execution_plan FROM query_log WHERE id=$1', [req.params.id]);
      if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(rows[0].execution_plan);
    } catch (err) { next(err); }
  };
}
