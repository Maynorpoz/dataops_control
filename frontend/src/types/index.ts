export type EngineType = 'PostgreSQL' | 'SQLServer' | 'Oracle';
export type ConnStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';
export type BackupType = 'FULL' | 'DIFF' | 'INC' | 'SNAPSHOT';
export type BackupStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
export type QueryClass = 'FAST' | 'MEDIUM' | 'SLOW' | 'CRITICAL';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Connection {
  id: number;
  nombre: string;
  motor: EngineType;
  host: string;
  port: number;
  database_name: string;
  user_name: string;
  status: ConnStatus;
  health_status: HealthStatus;
  last_checked_at: string | null;
  created_at: string;
  cpu?: number;
  memory?: number;
  connections?: number;
  locks?: number;
  deadlocks?: number;
  disk_usage?: number;
  disk_total?: number;
}

export interface DbMetric {
  id: string;
  db_id: number;
  cpu: number;
  memory: number;
  connections: number;
  locks: number;
  deadlocks: number;
  disk_usage: number;
  disk_total: number;
  health_status: HealthStatus;
  capture_time: string;
}

export interface QueryLog {
  id: string;
  db_id: number;
  query_text: string;
  duration_ms: number;
  rows_returned: number | null;
  index_used: string | null;
  execution_plan: object | null;
  classification: QueryClass;
  created_at: string;
}

export interface BackupHistory {
  id: string;
  db_id: number;
  backup_type: BackupType;
  parent_id: string | null;
  snapshot_label: string | null;
  file_path: string | null;
  file_size_mb: number | null;
  file_hash: string | null;
  duration_seconds: number | null;
  status: BackupStatus;
  cloud_url: string | null;
  restore_point: string | null;
  error_message: string | null;
  rpo_minutes: number | null;
  rto_minutes: number | null;
  sla_met: boolean | null;
  created_at: string;
  children?: BackupHistory[];
}

export interface AlertLog {
  id: string;
  db_id: number | null;
  rule_name: string;
  condition_value: number | null;
  threshold_value: number | null;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface AlertRule {
  id: number;
  rule_name: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: AlertSeverity;
  action: string;
  is_active: boolean;
}

export interface ReplicationLag {
  id: string;
  primary_db_id: number;
  replica_db_id: number;
  lag_seconds: number;
  scenario: string;
  health_status: HealthStatus;
  measured_at: string;
}

export interface DashboardData {
  connections: Connection[];
  summary: { healthy: number; warning: number; critical: number };
  openAlerts: number;
}

export interface ConcurrencyResult {
  totalTransactions: number;
  successCount: number;
  deadlockCount: number;
  resolvedDeadlocks: number;
  avgWaitTimeMs: number;
  durationMs: number;
}
