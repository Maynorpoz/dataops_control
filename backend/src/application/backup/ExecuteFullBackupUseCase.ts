import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs';
import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { AlertEngine } from '../../infrastructure/alerts/AlertEngine';
import { CloudUploadWorker } from '../../infrastructure/workers/CloudUploadWorker';
import { Connection } from '../../domain/entities/Connection';
import { BackupHistory } from '../../domain/entities/BackupHistory';

const execAsync = promisify(exec);

async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export class ExecuteFullBackupUseCase {
  async execute(connectionId: number): Promise<BackupHistory> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error('Connection not found');
    const conn = rows[0];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const storagePath = process.env.BACKUP_STORAGE_PATH || '/backups';
    const filePath = `${storagePath}/${conn.nombre}_FULL_${timestamp}.pgdump`;

    // Mark as RUNNING
    const [pending] = await query<BackupHistory>(
      `INSERT INTO backup_history (db_id, backup_type, status, restore_point)
       VALUES ($1,'FULL','RUNNING',NOW()) RETURNING *`,
      [connectionId]
    );

    const startTime = Date.now();

    try {
      const password = AES256Service.decrypt(conn.encrypted_password);

      await execAsync(
        `pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} -F c -f ${filePath}`,
        { env: { ...process.env, PGPASSWORD: password } }
      );

      const hash = await calculateFileHash(filePath);
      const stats = fs.statSync(filePath);
      const fileSizeMB = parseFloat((stats.size / (1024 * 1024)).toFixed(2));
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

      const [backup] = await query<BackupHistory>(
        `UPDATE backup_history
         SET status='SUCCESS', file_path=$1, file_size_mb=$2, file_hash=$3,
             duration_seconds=$4, restore_point=NOW()
         WHERE id=$5 RETURNING *`,
        [filePath, fileSizeMB, hash, durationSeconds, pending.id]
      );

      CloudUploadWorker.enqueue(backup.id).catch(console.error);
      await RedisService.invalidatePattern('cache:backup:*');

      return backup;
    } catch (error) {
      await query(
        `UPDATE backup_history SET status='FAILED', error_message=$1 WHERE id=$2`,
        [String(error), pending.id]
      );
      AlertEngine.fireBackupFailed(connectionId, String(error));
      throw error;
    }
  }
}
