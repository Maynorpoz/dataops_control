export type EngineType = 'PostgreSQL' | 'SQLServer' | 'Oracle';
export type ConnStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface Connection {
  id: number;
  nombre: string;
  motor: EngineType;
  host: string;
  port: number;
  database_name: string;
  user_name: string;
  encrypted_password: string;
  status: ConnStatus;
  health_status: HealthStatus;
  last_checked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
