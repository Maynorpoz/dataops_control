export interface TelemetryData {
  cpu: number;
  memory: number;
  activeConnections: number;
  activeLocks: number;
  deadlocks: number;
  diskUsageMB: number;
  diskTotalMB: number;
}

export interface SlowQuery {
  queryText: string;
  durationMs: number;
  rowsReturned: number;
  indexUsed: string | null;
  executionPlan: object;
}

export interface IDatabaseEngine {
  readonly engineType: 'PostgreSQL' | 'SQLServer' | 'Oracle';
  testConnection(): Promise<boolean>;
  collectTelemetry(): Promise<TelemetryData>;
  getSlowQueries(thresholdMs: number): Promise<SlowQuery[]>;
  executeQuery(sql: string): Promise<any[]>;
  killSession(sessionId: string): Promise<void>;
  measureReplicationLag(): Promise<number>;
}
