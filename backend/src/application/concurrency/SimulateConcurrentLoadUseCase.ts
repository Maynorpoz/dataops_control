import { Pool } from 'pg';
import { query } from '../../infrastructure/database/PostgresConnection';
import { Connection } from '../../domain/entities/Connection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';

export interface ConcurrencyResult {
  totalTransactions: number;
  successCount: number;
  deadlockCount: number;
  resolvedDeadlocks: number;
  avgWaitTimeMs: number;
  durationMs: number;
}

interface SessionResult {
  sessionId: string;
  success: boolean;
  waitTimeMs: number;
  isDeadlock: boolean;
}

export class SimulateConcurrentLoadUseCase {
  async execute(connectionId: number, concurrentUsers = 100): Promise<ConcurrencyResult> {
    const users = Math.max(concurrentUsers, 100);

    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error('Connection not found');
    const conn = rows[0];

    const pool = new Pool({
      host: conn.host, port: conn.port,
      database: conn.database_name, user: conn.user_name,
      password: AES256Service.decrypt(conn.encrypted_password),
      max: 30,
    });

    const startTime = Date.now();
    const results: SessionResult[] = [];

    const BATCH = 20;
    for (let i = 0; i < users; i += BATCH) {
      const batchSize = Math.min(BATCH, users - i);
      const batchPromises = Array.from({ length: batchSize }, (_, j) =>
        this.runSession(pool, connectionId, `session_${i + j}`)
      );
      const settled = await Promise.allSettled(batchPromises);
      settled.forEach((r) => {
        if (r.status === 'fulfilled') results.push(r.value);
        else results.push({ sessionId: 'unknown', success: false, waitTimeMs: 0, isDeadlock: true });
      });
    }

    await pool.end().catch(() => {});

    const deadlocks = results.filter((r) => r.isDeadlock);
    const resolved = deadlocks.length; // All deadlocks are resolved by terminating the session

    const totalWait = results.reduce((s, r) => s + r.waitTimeMs, 0);

    return {
      totalTransactions: results.length,
      successCount: results.filter((r) => r.success).length,
      deadlockCount: deadlocks.length,
      resolvedDeadlocks: resolved,
      avgWaitTimeMs: results.length > 0 ? Math.round(totalWait / results.length) : 0,
      durationMs: Date.now() - startTime,
    };
  }

  private async runSession(pool: Pool, dbId: number, sessionId: string): Promise<SessionResult> {
    const start = Date.now();
    let isDeadlock = false;
    let success = false;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ops = ['INSERT', 'UPDATE', 'SELECT', 'UPDATE'] as const;
      const op = ops[Math.floor(Math.random() * ops.length)];

      if (op === 'INSERT') {
        await client.query(
          `INSERT INTO orders (product_id, quantity, total) VALUES ($1, $2, $3)`,
          [Math.ceil(Math.random() * 10000), Math.ceil(Math.random() * 10), Math.random() * 500]
        );
      } else if (op === 'UPDATE') {
        const id = Math.ceil(Math.random() * 10000);
        await client.query(`UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0`, [id]);
      } else {
        await client.query(`SELECT id, name FROM products WHERE id = $1`, [Math.ceil(Math.random() * 10000)]);
      }

      await client.query('COMMIT');
      success = true;

      await query(
        `INSERT INTO tx_log (db_id, session_id, operacion, inicio, fin, wait_time, resolved)
         VALUES ($1,$2,$3,$4,NOW(),$5,FALSE)`,
        [dbId, sessionId, op, new Date(start), Date.now() - start]
      );
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      isDeadlock = err.code === '40P01'; // PostgreSQL deadlock error code

      await query(
        `INSERT INTO tx_log (db_id, session_id, operacion, inicio, fin, wait_time, lock_type, resolved)
         VALUES ($1,$2,'INSERT',$3,NOW(),$4,$5,$6)`,
        [dbId, sessionId, new Date(start), Date.now() - start, isDeadlock ? 'DEADLOCK' : 'TIMEOUT', isDeadlock]
      ).catch(() => {});
    } finally {
      client.release();
    }

    return { sessionId, success, waitTimeMs: Date.now() - start, isDeadlock };
  }
}
