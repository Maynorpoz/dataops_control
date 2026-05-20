import { EngineFactory } from '../../infrastructure/engines/EngineFactory';
import { query } from '../../infrastructure/database/PostgresConnection';

export class ResolveDeadlockUseCase {
  async execute(connectionId: number, sessionId: string): Promise<void> {
    const engine = await EngineFactory.createById(connectionId);
    await engine.killSession(sessionId);

    await query(
      `UPDATE tx_log SET resolved = TRUE, fin = NOW()
       WHERE db_id = $1 AND session_id = $2 AND lock_type = 'DEADLOCK'`,
      [connectionId, sessionId]
    );

    console.log(`[DeadlockResolver] Resolved session ${sessionId} on connection ${connectionId}`);
  }
}
