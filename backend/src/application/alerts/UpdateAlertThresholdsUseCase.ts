import { AlertRulesConfig } from '../../infrastructure/alerts/AlertRulesConfig';
import { AlertEngine } from '../../infrastructure/alerts/AlertEngine';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { AlertRule } from '../../domain/entities/AlertLog';

export class UpdateAlertThresholdsUseCase {
  async execute(rules: Partial<AlertRule>[]): Promise<void> {
    await AlertRulesConfig.update(rules);
    await AlertEngine.reloadRules(); // Hot reload — no restart needed
    await RedisService.invalidatePattern('cache:alerts:rules*');
  }
}
