import { query } from '../../infrastructure/database/PostgresConnection';
import { S3StorageService } from '../../infrastructure/storage/S3StorageService';
import { BackupHistory } from '../../domain/entities/BackupHistory';
import path from 'path';

export class UploadBackupToCloudUseCase {
  async execute(backupId: number): Promise<string> {
    const [backup] = await query<BackupHistory>('SELECT * FROM backup_history WHERE id=$1', [backupId]);
    if (!backup?.file_path) throw new Error('Backup file not found');

    const s3 = new S3StorageService();
    const s3Key = `backups/${path.basename(backup.file_path)}`;
    const cloudUrl = await s3.uploadWithStreaming(backup.file_path, s3Key);

    await query('UPDATE backup_history SET cloud_url=$1 WHERE id=$2', [cloudUrl, backupId]);
    return cloudUrl;
  }
}
