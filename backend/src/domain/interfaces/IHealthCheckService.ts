import { TelemetryData } from './IDatabaseEngine';
import { HealthStatus } from '../entities/Connection';

export interface IHealthCheckService {
  checkAll(): Promise<void>;
  classifyHealth(t: TelemetryData): HealthStatus;
}
