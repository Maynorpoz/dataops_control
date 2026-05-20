import { query } from '../database/PostgresConnection';
import { AlertRule } from '../../domain/entities/AlertLog';

export const AlertRulesConfig = {
  async getAll(): Promise<AlertRule[]> {
    return query<AlertRule>('SELECT * FROM alert_rules ORDER BY id');
  },

  async update(rules: Partial<AlertRule>[]): Promise<void> {
    for (const rule of rules) {
      if (!rule.rule_name) continue;
      await query(
        `UPDATE alert_rules
         SET metric=$1, operator=$2, threshold=$3, severity=$4, action=$5, is_active=$6, updated_at=NOW()
         WHERE rule_name=$7`,
        [rule.metric, rule.operator, rule.threshold, rule.severity, rule.action, rule.is_active, rule.rule_name]
      );
    }
  },
};
