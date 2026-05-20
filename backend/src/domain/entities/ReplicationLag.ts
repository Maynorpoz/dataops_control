import { HealthStatus } from './Connection';

export interface ReplicationLag {
  id: bigint;
  primary_db_id: number;
  replica_db_id: number;
  lag_seconds: number;
  scenario: string;
  health_status: HealthStatus;
  measured_at: Date;
}
