export type BackupType = 'FULL' | 'DIFF' | 'INC' | 'SNAPSHOT';
export type BackupStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type SnapshotLabel = 'PRE_DEPLOY' | 'PRE_TEST' | 'PRE_IMPORT';

export interface BackupHistory {
  id: bigint;
  db_id: number;
  backup_type: BackupType;
  parent_id: bigint | null;
  snapshot_label: SnapshotLabel | null;
  file_path: string | null;
  file_size_mb: number | null;
  file_hash: string | null;
  duration_seconds: number | null;
  status: BackupStatus;
  cloud_url: string | null;
  restore_point: Date | null;
  error_message: string | null;
  rpo_minutes: number | null;
  rto_minutes: number | null;
  sla_met: boolean | null;
  created_at: Date;
}
