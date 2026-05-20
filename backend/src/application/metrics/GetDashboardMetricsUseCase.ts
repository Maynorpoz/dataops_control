import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

export class GetDashboardMetricsUseCase {
  async execute() {
    return RedisService.getCached('cache:metrics:dashboard', async () => {
      const connections = await query(`
        SELECT c.id, c.nombre, c.motor, c.health_status,
               m.cpu, m.memory, m.connections, m.locks, m.deadlocks, m.disk_usage, m.disk_total, m.capture_time
        FROM connections c
        LEFT JOIN LATERAL (
          SELECT * FROM db_metrics WHERE db_id = c.id ORDER BY capture_time DESC LIMIT 1
        ) m ON TRUE
        WHERE c.status = 'ACTIVE'
        ORDER BY c.id
      `);

      const summary = await query(`
        SELECT
          COUNT(*) FILTER (WHERE health_status = 'HEALTHY') AS healthy,
          COUNT(*) FILTER (WHERE health_status = 'WARNING') AS warning,
          COUNT(*) FILTER (WHERE health_status = 'CRITICAL') AS critical
        FROM connections WHERE status = 'ACTIVE'
      `);

      const openAlerts = await query(`
        SELECT COUNT(*) AS cnt FROM alert_log WHERE status = 'OPEN'
      `);

      return { connections, summary: summary[0], openAlerts: parseInt(openAlerts[0]?.cnt || '0') };
    }, 30); // TTL: 30 seconds
  }
}
