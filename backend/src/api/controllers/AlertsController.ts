import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UpdateAlertThresholdsUseCase } from '../../application/alerts/UpdateAlertThresholdsUseCase';
import { AlertRulesConfig } from '../../infrastructure/alerts/AlertRulesConfig';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

const updateThresholds = new UpdateAlertThresholdsUseCase();

export class AlertsController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await RedisService.getCached('cache:alerts:all', () =>
        query('SELECT * FROM alert_log ORDER BY created_at DESC LIMIT 200'),
        30
      );
      res.json(data);
    } catch (err) { next(err); }
  };

  getOpen = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query("SELECT * FROM alert_log WHERE status='OPEN' ORDER BY created_at DESC");
      res.json(rows);
    } catch (err) { next(err); }
  };

  acknowledge = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await query(
        "UPDATE alert_log SET status='ACKNOWLEDGED', acknowledged_at=NOW() WHERE id=$1",
        [req.params.id]
      );
      res.json({ message: 'Acknowledged' });
    } catch (err) { next(err); }
  };

  resolve = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await query(
        "UPDATE alert_log SET status='RESOLVED', resolved_at=NOW() WHERE id=$1",
        [req.params.id]
      );
      res.json({ message: 'Resolved' });
    } catch (err) { next(err); }
  };

  getRules = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await RedisService.getCached('cache:alerts:rules', () =>
        AlertRulesConfig.getAll(), 300
      );
      res.json(data);
    } catch (err) { next(err); }
  };

  updateRules = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await updateThresholds.execute(req.body);
      res.json({ message: 'Rules updated and reloaded in hot' });
    } catch (err) { next(err); }
  };
}
