import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

export class GetQueryLogsUseCase {
  async getTopSlow(limit = 10) {
    return RedisService.getCached(`cache:queries:top-slow:${limit}`, () =>
      query(
        `SELECT * FROM query_log WHERE classification IN ('SLOW','CRITICAL')
         ORDER BY duration_ms DESC LIMIT $1`,
        [limit]
      ), 30
    );
  }

  async getAll(page = 1, pageSize = 20, classification?: string) {
    return RedisService.getCached(
      `cache:queries:list:${page}:${pageSize}:${classification || 'all'}`,
      async () => {
        const offset = (page - 1) * pageSize;
        const whereClause = classification ? `WHERE classification = $3` : '';
        const params = classification
          ? [pageSize, offset, classification]
          : [pageSize, offset];

        return query(
          `SELECT * FROM query_log ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
          params
        );
      },
      30
    );
  }
}
