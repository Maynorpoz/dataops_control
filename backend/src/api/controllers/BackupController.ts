import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ExecuteFullBackupUseCase } from '../../application/backup/ExecuteFullBackupUseCase';
import { ExecuteDiffBackupUseCase } from '../../application/backup/ExecuteDiffBackupUseCase';
import { ExecuteIncrementalBackupUseCase } from '../../application/backup/ExecuteIncrementalBackupUseCase';
import { CreateSnapshotUseCase } from '../../application/backup/CreateSnapshotUseCase';
import { RestoreSnapshotUseCase } from '../../application/backup/RestoreSnapshotUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { EngineFactory } from '../../infrastructure/engines/EngineFactory';
import { Connection } from '../../domain/entities/Connection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BackupController {
  private full = new ExecuteFullBackupUseCase();
  private diff = new ExecuteDiffBackupUseCase();
  private inc  = new ExecuteIncrementalBackupUseCase();
  private snap = new CreateSnapshotUseCase();
  private restore = new RestoreSnapshotUseCase();

  getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await RedisService.getCached('cache:backup:history', () =>
        query('SELECT * FROM backup_history ORDER BY created_at DESC LIMIT 100'),
        120
      );
      res.json(data);
    } catch (err) { next(err); }
  };

  runFull = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await this.full.execute(parseInt(req.params.dbId)));
    } catch (err) { next(err); }
  };

  runDiff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await this.diff.execute(parseInt(req.params.dbId)));
    } catch (err) { next(err); }
  };

  runIncremental = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await this.inc.execute(parseInt(req.params.dbId)));
    } catch (err) { next(err); }
  };

  getTree = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(
        `SELECT * FROM backup_history WHERE db_id=$1 ORDER BY created_at ASC`,
        [req.params.dbId]
      );
      // Build hierarchical tree
      const map = new Map<string, any>();
      const roots: any[] = [];
      rows.forEach((r: any) => { map.set(String(r.id), { ...r, children: [] }); });
      rows.forEach((r: any) => {
        if (r.parent_id) {
          map.get(String(r.parent_id))?.children.push(map.get(String(r.id)));
        } else {
          roots.push(map.get(String(r.id)));
        }
      });
      res.json(roots);
    } catch (err) { next(err); }
  };

  createSnapshot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { label } = req.body;
      if (!['PRE_DEPLOY','PRE_TEST','PRE_IMPORT'].includes(label)) {
        res.status(400).json({ error: 'label must be PRE_DEPLOY, PRE_TEST, or PRE_IMPORT' }); return;
      }
      res.json(await this.snap.execute(parseInt(req.params.dbId), label));
    } catch (err) { next(err); }
  };

  simulateDisaster = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { connectionId } = req.body;
      const conns = await query<Connection>('SELECT * FROM connections WHERE id=$1', [connectionId]);
      if (!conns.length) { res.status(404).json({ error: 'Connection not found' }); return; }
      const conn = conns[0];
      const password = AES256Service.decrypt(conn.encrypted_password);

      const lastBackup = (await query(
        `SELECT * FROM backup_history WHERE db_id=$1 AND status='SUCCESS' ORDER BY created_at DESC LIMIT 1`,
        [connectionId]
      ))[0];

      const disasterTime = new Date();

      // Simulate disaster: drop and recreate audit_log table
      await execAsync(
        `psql -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} -c "DROP TABLE IF EXISTS audit_log; CREATE TABLE audit_log (id BIGSERIAL PRIMARY KEY, note TEXT, performed_at TIMESTAMPTZ DEFAULT NOW());"`,
        { env: { ...process.env, PGPASSWORD: password } }
      );

      const rpoMinutes = lastBackup
        ? Math.ceil((disasterTime.getTime() - new Date(lastBackup.created_at).getTime()) / 60000)
        : null;

      res.json({
        message: 'Disaster simulated — audit_log dropped and recreated',
        disasterTime,
        rpoMinutes,
        lastBackupAt: lastBackup?.created_at || null,
        instructions: 'Use POST /api/backup/restore/:id to restore from snapshot',
      });
    } catch (err) { next(err); }
  };

  restoreBackup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await this.restore.execute(parseInt(req.params.id)));
    } catch (err) { next(err); }
  };

  getSla = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(`
        SELECT
          COUNT(*) FILTER (WHERE sla_met = TRUE) AS sla_met,
          COUNT(*) FILTER (WHERE sla_met = FALSE) AS sla_missed,
          AVG(rpo_minutes) AS avg_rpo,
          AVG(rto_minutes) AS avg_rto
        FROM backup_history
        WHERE status = 'SUCCESS'
      `);
      res.json(rows[0]);
    } catch (err) { next(err); }
  };
}
