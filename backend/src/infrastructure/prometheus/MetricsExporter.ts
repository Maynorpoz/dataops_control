import { Registry, Gauge, Counter, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();

collectDefaultMetrics({ register });

export const dbCpuGauge = new Gauge({
  name: 'dataops_db_cpu_percent',
  help: 'CPU usage percentage per database connection',
  labelNames: ['db_id', 'db_name', 'engine'],
  registers: [register],
});

export const dbMemoryGauge = new Gauge({
  name: 'dataops_db_memory_percent',
  help: 'Memory usage percentage per database connection',
  labelNames: ['db_id', 'db_name', 'engine'],
  registers: [register],
});

export const dbConnectionsGauge = new Gauge({
  name: 'dataops_db_active_connections',
  help: 'Active database connections',
  labelNames: ['db_id', 'db_name', 'engine'],
  registers: [register],
});

export const dbDeadlocksGauge = new Gauge({
  name: 'dataops_db_deadlocks_total',
  help: 'Total deadlocks detected',
  labelNames: ['db_id', 'db_name', 'engine'],
  registers: [register],
});

export const backupSuccessCounter = new Counter({
  name: 'dataops_backup_success_total',
  help: 'Total successful backups',
  labelNames: ['db_id', 'backup_type'],
  registers: [register],
});

export const backupFailureCounter = new Counter({
  name: 'dataops_backup_failure_total',
  help: 'Total failed backups',
  labelNames: ['db_id', 'backup_type'],
  registers: [register],
});

export const alertFiredCounter = new Counter({
  name: 'dataops_alerts_fired_total',
  help: 'Total alerts fired',
  labelNames: ['rule_name', 'severity'],
  registers: [register],
});

export const replicationLagGauge = new Gauge({
  name: 'dataops_replication_lag_seconds',
  help: 'Replication lag in seconds',
  labelNames: ['primary_id', 'replica_id'],
  registers: [register],
});
