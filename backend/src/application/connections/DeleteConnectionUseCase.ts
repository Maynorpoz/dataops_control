import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { EngineFactory } from '../../infrastructure/engines/EngineFactory';

export class DeleteConnectionUseCase {
  async execute(id: number): Promise<void> {
    // Nullify FKs without CASCADE before deleting to avoid FK violations.
    // replication_lag and alert_log keep historical data with null reference.
    await query(
      'UPDATE replication_lag SET primary_db_id = NULL WHERE primary_db_id = $1',
      [id]
    );
    await query(
      'UPDATE replication_lag SET replica_db_id = NULL WHERE replica_db_id = $1',
      [id]
    );
    await query(
      'UPDATE alert_log SET db_id = NULL WHERE db_id = $1',
      [id]
    );

    await query('DELETE FROM connections WHERE id = $1', [id]);

    // Evict the cached engine so its pool is released
    EngineFactory.evict(id);
    await RedisService.invalidatePattern('cache:connections:*');
  }
}
