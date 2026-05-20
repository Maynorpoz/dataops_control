import { BackupHistory } from '../entities/BackupHistory';

export interface IBackupStrategy {
  execute(connectionId: number, parentId?: bigint): Promise<BackupHistory>;
}
