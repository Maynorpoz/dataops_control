import cron from 'node-cron';
import { query } from '../database/PostgresConnection';
import { EngineFactory } from '../engines/EngineFactory';
import { TelemetryData } from '../../domain/interfaces/IDatabaseEngine';
import { Connection, HealthStatus } from '../../domain/entities/Connection';

function classifyHealth(t: TelemetryData): HealthStatus {
  if (t.cpu > 85 || t.memory > 85 || t.deadlocks > 3 || (t.diskUsageMB / t.diskTotalMB) > 0.9)
    return 'CRITICAL';
  if (t.cpu > 70 || t.memory > 70 || t.activeLocks > 5)
    return 'WARNING';
  return 'HEALTHY';
}

export function startHealthCheckWorker() {
  // Exactly every 60 seconds
  cron.schedule('*/1 * * * *', async () => {
    console.log(`[HealthCheck] ${new Date().toISOString()} — Iniciando ciclo de telemetría`);

    const connections = await query<Connection>(
      "SELECT * FROM connections WHERE status = 'ACTIVE'"
    );

    await Promise.allSettled(
      connections.map(async (conn) => {
        try {
          const engine = EngineFactory.create(conn);
          const telemetry = await engine.collectTelemetry();
          const health = classifyHealth(telemetry);

          await query(
            `INSERT INTO db_metrics (db_id, cpu, memory, connections, locks, deadlocks, disk_usage, disk_total, health_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [conn.id, telemetry.cpu, telemetry.memory, telemetry.activeConnections,
             telemetry.activeLocks, telemetry.deadlocks, telemetry.diskUsageMB, telemetry.diskTotalMB, health]
          );

          await query(
            'UPDATE connections SET health_status=$1, last_checked_at=NOW() WHERE id=$2',
            [health, conn.id]
          );

          // Evaluate alert rules asynchronously (non-blocking)
          const { AlertEngine } = await import('../alerts/AlertEngine');
          AlertEngine.evaluate(conn.id, telemetry).catch(console.error);
        } catch (err) {
          console.error(`[HealthCheck] Error on connection ${conn.id}:`, err);
        }
      })
    );
  });

  console.log('[HealthCheckWorker] Started — cron */1 * * * *');
}
