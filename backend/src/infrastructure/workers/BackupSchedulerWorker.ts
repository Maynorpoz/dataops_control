import cron from 'node-cron';
import { query } from '../database/PostgresConnection';
import { Connection } from '../../domain/entities/Connection';

async function runBackup(type: 'full' | 'diff' | 'inc') {
  const connections = await query<Connection>("SELECT * FROM connections WHERE status = 'ACTIVE'");
  for (const conn of connections) {
    try {
      const { ExecuteFullBackupUseCase } = await import('../../application/backup/ExecuteFullBackupUseCase');
      const { ExecuteDiffBackupUseCase } = await import('../../application/backup/ExecuteDiffBackupUseCase');
      const { ExecuteIncrementalBackupUseCase } = await import('../../application/backup/ExecuteIncrementalBackupUseCase');

      if (type === 'full') await new ExecuteFullBackupUseCase().execute(conn.id);
      else if (type === 'diff') await new ExecuteDiffBackupUseCase().execute(conn.id);
      else await new ExecuteIncrementalBackupUseCase().execute(conn.id);

      console.log(`[BackupScheduler] ${type.toUpperCase()} backup completed for connection ${conn.id}`);
    } catch (err) {
      console.error(`[BackupScheduler] ${type} backup failed for connection ${conn.id}:`, err);
    }
  }
}

export function startBackupSchedulerWorker() {
  // Full backup — daily at 02:00
  cron.schedule('0 2 * * *', () => runBackup('full'));
  // Diff backup — every 6 hours
  cron.schedule('0 */6 * * *', () => runBackup('diff'));
  // Incremental backup — every hour
  cron.schedule('0 * * * *', () => runBackup('inc'));

  console.log('[BackupSchedulerWorker] Started — Full@02:00 | Diff@every6h | Inc@every1h');
}
