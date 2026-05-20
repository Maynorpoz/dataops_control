import { HealthStatus } from './Connection';

export interface DbMetric {
  id: bigint;
  db_id: number;
  cpu: number;
  memory: number;
  connections: number;
  locks: number;
  deadlocks: number;
  disk_usage: number;
  disk_total: number;
  health_status: HealthStatus;
  capture_time: Date;
}
