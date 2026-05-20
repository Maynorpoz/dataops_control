import { query } from '../database/PostgresConnection';
import { S3StorageService } from '../storage/S3StorageService';
import path from 'path';

const uploadQueue: bigint[] = [];
let isProcessing = false;

export const CloudUploadWorker = {
  enqueue(backupId: bigint): Promise<void> {
    uploadQueue.push(backupId);
    if (!isProcessing) processQueue();
    return Promise.resolve();
  },
};

async function processQueue() {
  isProcessing = true;
  while (uploadQueue.length > 0) {
    const backupId = uploadQueue.shift()!;
    try {
      const rows = await query('SELECT * FROM backup_history WHERE id = $1', [backupId]);
      if (!rows.length || !rows[0].file_path) continue;

      const backup = rows[0];
      const s3Key = `backups/${path.basename(backup.file_path)}`;

      const s3 = new S3StorageService();
      const cloudUrl = await s3.uploadWithStreaming(backup.file_path, s3Key);

      await query('UPDATE backup_history SET cloud_url = $1 WHERE id = $2', [cloudUrl, backupId]);
      console.log(`[CloudUpload] Backup ${backupId} uploaded to ${cloudUrl}`);
    } catch (err) {
      console.error(`[CloudUpload] Failed for backup ${backupId}:`, err);
    }
  }
  isProcessing = false;
}
