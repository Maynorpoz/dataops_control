import { EngineFactory } from '../../infrastructure/engines/EngineFactory';
import { query } from '../../infrastructure/database/PostgresConnection';
import { TelemetryData } from '../../domain/interfaces/IDatabaseEngine';

export class CollectMetricsUseCase {
  async execute(connectionId: number): Promise<TelemetryData> {
    const engine = await EngineFactory.createById(connectionId);
    const telemetry = await engine.collectTelemetry();

    const health =
      telemetry.cpu > 85 || telemetry.memory > 85 || telemetry.deadlocks > 3 ? 'CRITICAL' :
      telemetry.cpu > 70 || telemetry.memory > 70 || telemetry.activeLocks > 5 ? 'WARNING' :
      'HEALTHY';

    await query(
      `INSERT INTO db_metrics (db_id, cpu, memory, connections, locks, deadlocks, disk_usage, disk_total, health_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [connectionId, telemetry.cpu, telemetry.memory, telemetry.activeConnections,
       telemetry.activeLocks, telemetry.deadlocks, telemetry.diskUsageMB, telemetry.diskTotalMB, health]
    );

    return telemetry;
  }
}
