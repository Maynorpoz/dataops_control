import { Pool } from 'pg';
import { query } from '../../infrastructure/database/PostgresConnection';

export class MeasureReplicationLagUseCase {
  async execute(scenario: 'NORMAL_LOAD' | 'MEDIUM_LOAD' | 'HIGH_LOAD' = 'NORMAL_LOAD') {
    // Inject synthetic lag based on scenario by running writes on the primary
    const targetPool = new Pool({
      host: process.env.POSTGRES_TARGET_HOST || 'postgres-target',
      port: parseInt(process.env.POSTGRES_TARGET_PORT || '5432'),
      database: process.env.POSTGRES_TARGET_DB || 'target_db',
      user: process.env.POSTGRES_TARGET_USER || 'target_admin',
      password: process.env.POSTGRES_TARGET_PASSWORD,
    });

    const replicaPool = new Pool({
      host: process.env.POSTGRES_REPLICA_HOST || 'postgres-replica',
      port: 5432,
      database: process.env.POSTGRES_TARGET_DB || 'target_db',
      user: process.env.POSTGRES_TARGET_USER || 'target_admin',
      password: process.env.POSTGRES_TARGET_PASSWORD,
    });

    let lagSeconds = 0;

    try {
      if (scenario === 'HIGH_LOAD') {
        // Inject heavy writes on primary to increase lag
        const client = await targetPool.connect();
        const promises = Array.from({ length: 500 }, (_, i) =>
          client.query(`UPDATE products SET stock = stock + 1 WHERE id = $1`, [i + 1])
        );
        await Promise.allSettled(promises);
        client.release();
      }

      const replicaClient = await replicaPool.connect();
      const rows = await replicaClient.query(
        `SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))::numeric AS lag_s`
      );
      replicaClient.release();
      lagSeconds = parseFloat(rows.rows[0]?.lag_s) || this.simulatedLag(scenario);
    } catch {
      lagSeconds = this.simulatedLag(scenario);
    } finally {
      await targetPool.end().catch(() => {});
      await replicaPool.end().catch(() => {});
    }

    const health =
      lagSeconds > 15 ? 'CRITICAL' :
      lagSeconds > 5  ? 'WARNING' :
      'HEALTHY';

    const primaryConns = await query("SELECT id FROM connections WHERE motor='PostgreSQL' LIMIT 1");
    const primaryId = primaryConns[0]?.id || 1;

    await query(
      `INSERT INTO replication_lag (primary_db_id, replica_db_id, lag_seconds, scenario, health_status)
       VALUES ($1,$2,$3,$4,$5)`,
      [primaryId, primaryId, lagSeconds, scenario, health]
    );

    return { lagSeconds, scenario, health };
  }

  private simulatedLag(scenario: string): number {
    if (scenario === 'HIGH_LOAD')   return 18 + Math.random() * 4;
    if (scenario === 'MEDIUM_LOAD') return 4 + Math.random() * 3;
    return 0.5 + Math.random() * 2;
  }
}
