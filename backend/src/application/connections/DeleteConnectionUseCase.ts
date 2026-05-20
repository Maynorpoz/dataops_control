import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

export class DeleteConnectionUseCase {
  async execute(id: number): Promise<void> {
    await query('DELETE FROM connections WHERE id = $1', [id]);
    await RedisService.invalidatePattern('cache:connections:*');
  }
}
