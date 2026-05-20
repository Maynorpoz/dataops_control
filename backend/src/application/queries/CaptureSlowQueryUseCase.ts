import { EngineFactory } from '../../infrastructure/engines/EngineFactory';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { QueryClass } from '../../domain/entities/QueryLog';

function classify(durationMs: number): QueryClass {
  if (durationMs < 100)  return 'FAST';
  if (durationMs < 1000) return 'MEDIUM';
  if (durationMs < 5000) return 'SLOW';
  return 'CRITICAL';
}

export class CaptureSlowQueryUseCase {
  async execute(connectionId: number, thresholdMs = 100): Promise<number> {
    const engine = await EngineFactory.createById(connectionId);
    const slowQueries = await engine.getSlowQueries(thresholdMs);

    let inserted = 0;
    for (const sq of slowQueries) {
      await query(
        `INSERT INTO query_log (db_id, query_text, duration_ms, rows_returned, index_used, execution_plan, classification)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [connectionId, sq.queryText, sq.durationMs, sq.rowsReturned, sq.indexUsed,
         JSON.stringify(sq.executionPlan), classify(sq.durationMs)]
      );
      inserted++;
    }

    await RedisService.invalidatePattern('cache:queries:*');
    return inserted;
  }
}
