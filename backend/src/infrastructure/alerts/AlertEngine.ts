import { EventEmitter } from 'events';
import { query } from '../database/PostgresConnection';
import { TelemetryData } from '../../domain/interfaces/IDatabaseEngine';
import { AlertLog, AlertRule } from '../../domain/entities/AlertLog';

class AlertEngineClass extends EventEmitter {
  private rules: AlertRule[] = [];

  async initialize(): Promise<void> {
    this.rules = await query<AlertRule>('SELECT * FROM alert_rules WHERE is_active = TRUE');
    console.log(`[AlertEngine] Loaded ${this.rules.length} rules`);
  }

  async reloadRules(): Promise<void> {
    this.rules = await query<AlertRule>('SELECT * FROM alert_rules WHERE is_active = TRUE');
    console.log(`[AlertEngine] Rules reloaded: ${this.rules.length} active`);
  }

  private applyOperator(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>':  return value > threshold;
      case '<':  return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '=':  return value === threshold;
      default:   return false;
    }
  }

  async evaluate(dbId: number, metrics: TelemetryData): Promise<void> {
    const metricMap: Record<string, number> = {
      cpu:         metrics.cpu,
      memory:      metrics.memory,
      connections: metrics.activeConnections,
      locks:       metrics.activeLocks,
      deadlocks:   metrics.deadlocks,
      disk_usage:  (metrics.diskUsageMB / metrics.diskTotalMB) * 100,
    };

    for (const rule of this.rules) {
      const currentValue = metricMap[rule.metric];
      if (currentValue === undefined) continue;
      if (!this.applyOperator(currentValue, rule.operator, rule.threshold)) continue;

      const alert: Partial<AlertLog> = {
        db_id: dbId,
        rule_name: rule.rule_name,
        condition_value: currentValue,
        threshold_value: rule.threshold,
        severity: rule.severity,
        status: 'OPEN',
        message: `${rule.rule_name}: current=${currentValue.toFixed(2)} ${rule.operator} threshold=${rule.threshold}`,
      };

      this.emit('alert', alert);
    }
  }

  fireBackupFailed(dbId: number, error: string): void {
    this.emit('alert', {
      db_id: dbId,
      severity: 'CRITICAL',
      rule_name: 'BACKUP_FAILED',
      status: 'OPEN',
      message: `Backup failed: ${error}`,
    } as Partial<AlertLog>);
  }
}

export const AlertEngine = new AlertEngineClass();

// Register observers
AlertEngine.on('alert', async (alert: Partial<AlertLog>) => {
  try {
    const { DashboardNotifier } = await import('./DashboardNotifier');
    DashboardNotifier.notify(alert);
  } catch {}
});

AlertEngine.on('alert', async (alert: Partial<AlertLog>) => {
  try {
    const { EmailService } = await import('./EmailService');
    await EmailService.send(alert);
  } catch {}
});

AlertEngine.on('alert', async (alert: Partial<AlertLog>) => {
  try {
    if (alert.severity && alert.message && alert.rule_name) {
      await query(
        `INSERT INTO alert_log (db_id, rule_name, condition_value, threshold_value, severity, status, message)
         VALUES ($1,$2,$3,$4,$5,'OPEN',$6)`,
        [alert.db_id || null, alert.rule_name, alert.condition_value || null,
         alert.threshold_value || null, alert.severity, alert.message]
      );
    }
  } catch {}
});
