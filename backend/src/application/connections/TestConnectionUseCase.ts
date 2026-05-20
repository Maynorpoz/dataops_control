import { query } from '../../infrastructure/database/PostgresConnection';
import { EngineFactory } from '../../infrastructure/engines/EngineFactory';
import { Connection } from '../../domain/entities/Connection';

export class TestConnectionUseCase {
  async execute(id: number): Promise<{ success: boolean; latencyMs: number }> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [id]);
    if (!rows.length) throw new Error('Connection not found');

    const start = Date.now();
    const engine = EngineFactory.create(rows[0]);
    const success = await engine.testConnection();
    const latencyMs = Date.now() - start;

    const health = success ? 'HEALTHY' : 'ERROR';
    await query(
      "UPDATE connections SET health_status=$1, status=$2, last_checked_at=NOW() WHERE id=$3",
      [success ? 'HEALTHY' : 'CRITICAL', health, id]
    );

    return { success, latencyMs };
  }
}
