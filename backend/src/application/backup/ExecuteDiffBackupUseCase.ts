import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs';
import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { CloudUploadWorker } from '../../infrastructure/workers/CloudUploadWorker';
import { Connection } from '../../domain/entities/Connection';
import { BackupHistory } from '../../domain/entities/BackupHistory';

const execAsync = promisify(exec);

export class ExecuteDiffBackupUseCase {
  async execute(connectionId: number): Promise<BackupHistory> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error('Connection not found');
    const conn = rows[0];

    // Find latest FULL backup to link as parent
    const [parent] = await query<BackupHistory>(
      `SELECT * FROM backup_history WHERE db_id = $1 AND backup_type = 'FULL' AND status = 'SUCCESS'
       ORDER BY created_at DESC LIMIT 1`,
      [connectionId]
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const storagePath = process.env.BACKUP_STORAGE_PATH || '/backups';
    const safeName = conn.nombre.replace(/\s+/g, '_');
    const filePath = `${storagePath}/${safeName}_DIFF_${timestamp}.pgdump`;

    const [pending] = await query<BackupHistory>(
      `INSERT INTO backup_history (db_id, backup_type, parent_id, status, restore_point)
       VALUES ($1,'DIFF',$2,'RUNNING',NOW()) RETURNING *`,
      [connectionId, parent?.id || null]
    );

    const startTime = Date.now();
    try {
      const password = AES256Service.decrypt(conn.encrypted_password);
      await execAsync(
        `pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} -F c -f "${filePath}"`,
        { env: { ...process.env, PGPASSWORD: password } }
      );

      const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      const stats = fs.statSync(filePath);
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

      const [backup] = await query<BackupHistory>(
        `UPDATE backup_history SET status='SUCCESS', file_path=$1, file_size_mb=$2, file_hash=$3, duration_seconds=$4
         WHERE id=$5 RETURNING *`,
        [filePath, (stats.size / 1024 / 1024).toFixed(2), hash, durationSeconds, pending.id]
      );

      CloudUploadWorker.enqueue(backup.id).catch(console.error);
      await RedisService.invalidatePattern('cache:backup:*');
      return backup;
    } catch (error) {
      await query(`UPDATE backup_history SET status='FAILED', error_message=$1 WHERE id=$2`, [String(error), pending.id]);
      throw error;
    }
  }
}
