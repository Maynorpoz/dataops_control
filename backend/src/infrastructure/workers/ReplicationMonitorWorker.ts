import cron from 'node-cron';
import { Pool } from 'pg';
import { query } from '../database/PostgresConnection';

function classifyLag(lagSeconds: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
  if (lagSeconds > 15) return 'CRITICAL';
  if (lagSeconds > 5)  return 'WARNING';
  return 'HEALTHY';
}

export function startReplicationMonitorWorker() {
  // Measure lag every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const primaryConns = await query(`
        SELECT c.id FROM connections c
        WHERE c.motor = 'PostgreSQL' AND c.status = 'ACTIVE'
        LIMIT 1
      `);
      if (!primaryConns.length) return;

      const primaryId = primaryConns[0].id;

      // Connect to the replica to measure lag
      const replicaPool = new Pool({
        host: process.env.POSTGRES_TARGET_HOST || 'postgres-target',
        port: parseInt(process.env.POSTGRES_TARGET_PORT || '5432'),
        database: process.env.POSTGRES_TARGET_DB || 'target_db',
        user: process.env.POSTGRES_TARGET_USER || 'target_admin',
        password: process.env.POSTGRES_TARGET_PASSWORD,
      });

      try {
        const client = await replicaPool.connect();
        const rows = await client.query(`
          SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))::numeric AS lag_s
        `);
        client.release();

        let lagSeconds = parseFloat(rows.rows[0]?.lag_s) || 0;
        // Null means it's primary or no replication — simulate small lag
        if (isNaN(lagSeconds)) lagSeconds = 0.5;

        const health = classifyLag(lagSeconds);
        const scenario = lagSeconds < 3 ? 'NORMAL_LOAD' : lagSeconds < 10 ? 'MEDIUM_LOAD' : 'HIGH_LOAD';

        await query(
          `INSERT INTO replication_lag (primary_db_id, replica_db_id, lag_seconds, scenario, health_status)
           VALUES ($1, $2, $3, $4, $5)`,
          [primaryId, primaryId, lagSeconds, scenario, health]
        );

        if (health !== 'HEALTHY') {
          const { AlertEngine } = await import('../alerts/AlertEngine');
          AlertEngine.evaluate(primaryId, {
            cpu: 0, memory: 0, activeConnections: 0, activeLocks: 0,
            deadlocks: 0, diskUsageMB: 0, diskTotalMB: 100,
          } as any).catch(() => {});
        }
      } finally {
        await replicaPool.end().catch(() => {});
      }
    } catch (err) {
      console.error('[ReplicationMonitor] Error:', err);
    }
  });

  console.log('[ReplicationMonitorWorker] Started — every 30s');
}
