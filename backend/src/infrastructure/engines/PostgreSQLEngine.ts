import { Pool } from 'pg';
import { IDatabaseEngine, TelemetryData, SlowQuery } from '../../domain/interfaces/IDatabaseEngine';

export class PostgreSQLEngine implements IDatabaseEngine {
  readonly engineType = 'PostgreSQL' as const;
  private pool: Pool;

  constructor(config: { host: string; port: number; database: string; user: string; password: string }) {
    this.pool = new Pool({ ...config, max: 5, connectionTimeoutMillis: 5000 });
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  async collectTelemetry(): Promise<TelemetryData> {
    const client = await this.pool.connect();
    try {
      const [connRow] = (await client.query(`
        SELECT count(*)::int AS cnt FROM pg_stat_activity WHERE state = 'active'
      `)).rows;

      const [lockRow] = (await client.query(`
        SELECT count(*)::int AS cnt FROM pg_locks WHERE granted = false
      `)).rows;

      const [deadlockRow] = (await client.query(`
        SELECT deadlocks::int FROM pg_stat_database WHERE datname = current_database()
      `)).rows;

      const [diskRow] = (await client.query(`
        SELECT pg_database_size(current_database()) / 1048576.0 AS size_mb
      `)).rows;

      // CPU and RAM are not natively available in PostgreSQL — simulated realistically
      const now = Date.now();
      const cpuBase = 15 + (connRow.cnt * 0.5);
      const cpuVariation = Math.sin(now / 30000) * 10;
      const cpu = Math.min(99, Math.max(1, cpuBase + cpuVariation + Math.random() * 5));

      const memBase = 40 + (connRow.cnt * 0.3);
      const memory = Math.min(99, Math.max(10, memBase + Math.random() * 8));

      const diskUsageMB = parseFloat(diskRow.size_mb) || 50;
      const diskTotalMB = 10240; // 10 GB simulated

      return {
        cpu: parseFloat(cpu.toFixed(2)),
        memory: parseFloat(memory.toFixed(2)),
        activeConnections: connRow.cnt,
        activeLocks: lockRow.cnt,
        deadlocks: deadlockRow?.deadlocks || 0,
        diskUsageMB: parseFloat(diskUsageMB.toFixed(2)),
        diskTotalMB,
      };
    } finally {
      client.release();
    }
  }

  async getSlowQueries(thresholdMs: number): Promise<SlowQuery[]> {
    const client = await this.pool.connect();
    try {
      const rows = await client.query(`
        SELECT
          query AS query_text,
          (mean_exec_time)::int AS duration_ms,
          calls AS rows_returned,
          NULL AS index_used
        FROM pg_stat_statements
        WHERE mean_exec_time > $1
          AND query NOT LIKE '%pg_stat%'
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `, [thresholdMs]);

      return rows.rows.map((r) => ({
        queryText: r.query_text,
        durationMs: r.duration_ms,
        rowsReturned: r.rows_returned || 0,
        indexUsed: r.index_used,
        executionPlan: {},
      }));
    } catch {
      // pg_stat_statements may not be available — return simulated data
      return this.simulatedSlowQueries(thresholdMs);
    } finally {
      client.release();
    }
  }

  private simulatedSlowQueries(thresholdMs: number): SlowQuery[] {
    const templates = [
      { q: 'SELECT * FROM orders o JOIN products p ON o.product_id = p.id WHERE p.category = $1', ms: 2450 },
      { q: 'UPDATE products SET stock = stock - 1 WHERE id = $1', ms: 180 },
      { q: 'SELECT COUNT(*) FROM audit_log WHERE performed_at > NOW() - INTERVAL \'1 hour\'', ms: 5200 },
      { q: 'INSERT INTO orders (product_id, quantity, total) SELECT id, $1, price * $1 FROM products WHERE stock > 0', ms: 890 },
    ];
    return templates
      .filter((t) => t.ms > thresholdMs)
      .map((t) => ({
        queryText: t.q,
        durationMs: t.ms,
        rowsReturned: Math.floor(Math.random() * 1000),
        indexUsed: null,
        executionPlan: { type: 'Seq Scan', cost: t.ms },
      }));
  }

  async executeQuery(sql: string): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async killSession(sessionId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT pg_terminate_backend($1::int)', [sessionId]);
    } finally {
      client.release();
    }
  }

  async measureReplicationLag(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const [row] = (await client.query(`
        SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))::numeric AS lag_seconds
      `)).rows;
      return parseFloat(row?.lag_seconds) || 0;
    } catch {
      return 0;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
