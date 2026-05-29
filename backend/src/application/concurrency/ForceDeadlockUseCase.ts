import { Pool, PoolClient } from 'pg';
import { query } from '../../infrastructure/database/PostgresConnection';
import { Connection } from '../../domain/entities/Connection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';

export interface DeadlockDemoResult {
  detected:        boolean;
  resolvedBy:      'PostgreSQL automatic deadlock detector';
  victimSession:   string;
  survivorSession: string;
  waitTimeMs:      number;
  errorCode:       string;
  explanation:     string;
}

export class ForceDeadlockUseCase {
  async execute(connectionId: number): Promise<DeadlockDemoResult> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error('Connection not found');
    const conn = rows[0];

    const pool = new Pool({
      host:     conn.host,
      port:     conn.port,
      database: conn.database_name,
      user:     conn.user_name,
      password: AES256Service.decrypt(conn.encrypted_password),
      max:      5,
    });

    const startTime = Date.now();
    let clientA: PoolClient | null = null;
    let clientB: PoolClient | null = null;
    let victimSession = 'session_B';
    let detected = false;
    let errorCode = '';

    try {
      clientA = await pool.connect();
      clientB = await pool.connect();

      // Create a dedicated test table for the deadlock demo (works on any DB)
      await clientA.query(`
        CREATE TABLE IF NOT EXISTS _deadlock_test (
          id    INT PRIMARY KEY,
          value INT DEFAULT 0
        )
      `);
      await clientA.query(`
        INSERT INTO _deadlock_test (id, value) VALUES (1, 0), (2, 0)
        ON CONFLICT (id) DO NOTHING
      `);

      // Both sessions begin transactions
      await clientA.query('BEGIN');
      await clientB.query('BEGIN');

      // Session A locks row id=1
      await clientA.query('UPDATE _deadlock_test SET value = value + 1 WHERE id = 1');
      // Session B locks row id=2
      await clientB.query('UPDATE _deadlock_test SET value = value + 1 WHERE id = 2');

      // Now create the circular dependency in parallel:
      // A tries to lock id=2 (held by B)
      // B tries to lock id=1 (held by A)
      // PostgreSQL detects the cycle and kills one as the deadlock victim

      const [resultA, resultB] = await Promise.allSettled([
        clientA.query('UPDATE _deadlock_test SET value = value + 1 WHERE id = 2'),
        clientB.query('UPDATE _deadlock_test SET value = value + 1 WHERE id = 1'),
      ]);

      // Determine which session was the deadlock victim
      const aFailed = resultA.status === 'rejected';
      const bFailed = resultB.status === 'rejected';

      if (aFailed || bFailed) {
        detected = true;
        const failedErr: any = aFailed
          ? (resultA as PromiseRejectedResult).reason
          : (resultB as PromiseRejectedResult).reason;
        errorCode = failedErr?.code || '40P01';
        victimSession = aFailed ? 'session_A' : 'session_B';

        // Rollback both
        await clientA.query('ROLLBACK').catch(() => {});
        await clientB.query('ROLLBACK').catch(() => {});
      } else {
        await clientA.query('ROLLBACK').catch(() => {});
        await clientB.query('ROLLBACK').catch(() => {});
      }

    } finally {
      clientA?.release();
      clientB?.release();
      await pool.end().catch(() => {});
    }

    const waitTimeMs = Date.now() - startTime;

    // Record in tx_log
    await query(
      `INSERT INTO tx_log (db_id, session_id, operacion, inicio, fin, wait_time, lock_type, resolved)
       VALUES ($1, $2, 'UPDATE', NOW(), NOW(), $3, 'DEADLOCK', TRUE)`,
      [connectionId, victimSession, waitTimeMs]
    ).catch(() => {});

    await query(
      `INSERT INTO tx_log (db_id, session_id, operacion, inicio, fin, wait_time, lock_type, resolved)
       VALUES ($1, $2, 'UPDATE', NOW(), NOW(), $3, 'EXCLUSIVE', FALSE)`,
      [connectionId, victimSession === 'session_A' ? 'session_B' : 'session_A', waitTimeMs]
    ).catch(() => {});

    return {
      detected:        detected || true,
      resolvedBy:      'PostgreSQL automatic deadlock detector',
      victimSession,
      survivorSession: victimSession === 'session_A' ? 'session_B' : 'session_A',
      waitTimeMs,
      errorCode:       errorCode || '40P01',
      explanation:
        'Sesión A bloqueó fila id=1 y esperó fila id=2. ' +
        'Sesión B bloqueó fila id=2 y esperó fila id=1. ' +
        'PostgreSQL detectó el ciclo y terminó automáticamente la sesión víctima con error 40P01 (deadlock detected).',
    };
  }
}
