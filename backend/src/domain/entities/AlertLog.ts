export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertLog {
  id: bigint;
  db_id: number | null;
  rule_name: string;
  condition_value: number | null;
  threshold_value: number | null;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  acknowledged_at: Date | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface AlertRule {
  id: number;
  rule_name: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: AlertSeverity;
  action: string;
  is_active: boolean;
  updated_at: Date;
}
