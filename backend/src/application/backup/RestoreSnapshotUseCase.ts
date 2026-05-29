import { exec } from 'child_process';
import { promisify } from 'util';
import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { Connection } from '../../domain/entities/Connection';
import { BackupHistory } from '../../domain/entities/BackupHistory';

const execAsync = promisify(exec);

export class RestoreSnapshotUseCase {
  async execute(backupId: number): Promise<{ rtoMinutes: number; restored: boolean }> {
    const [backup] = await query<BackupHistory>(
      'SELECT * FROM backup_history WHERE id = $1', [backupId]
    );
    if (!backup || !backup.file_path) throw new Error('Backup not found or has no file');

    const conn = (await query<Connection>('SELECT * FROM connections WHERE id = $1', [backup.db_id]))[0];
    const password = AES256Service.decrypt(conn.encrypted_password);

    const startTime = Date.now();
    try {
      await execAsync(
        `pg_restore -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} --clean --no-owner -F c "${backup.file_path}"`,
        { env: { ...process.env, PGPASSWORD: password } }
      );

      const rtoMinutes = Math.ceil((Date.now() - startTime) / 60000);

      await query(
        'UPDATE backup_history SET rto_minutes=$1, sla_met=$2 WHERE id=$3',
        [rtoMinutes, rtoMinutes <= 30, backupId]
      );

      return { rtoMinutes, restored: true };
    } catch (error) {
      throw new Error(`Restore failed: ${error}`);
    }
  }
}
