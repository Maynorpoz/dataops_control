import { IDatabaseEngine, TelemetryData, SlowQuery } from '../../domain/interfaces/IDatabaseEngine';

// Oracle engine is fully simulated — oracledb requires Oracle Instant Client binary
// In production, replace simulated methods with real oracledb calls
export class OracleEngine implements IDatabaseEngine {
  readonly engineType = 'Oracle' as const;
  private config: { host: string; port: number; database: string; user: string; password: string };

  constructor(config: { host: string; port: number; database: string; user: string; password: string }) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    console.log(`[OracleEngine] Simulated connection test to ${this.config.host}`);
    return true;
  }

  async collectTelemetry(): Promise<TelemetryData> {
    const t = Date.now();
    return {
      cpu: parseFloat((12 + Math.sin(t / 20000) * 8 + Math.random() * 5).toFixed(2)),
      memory: parseFloat((55 + Math.random() * 10).toFixed(2)),
      activeConnections: Math.floor(5 + Math.random() * 15),
      activeLocks: Math.floor(Math.random() * 4),
      deadlocks: 0,
      diskUsageMB: parseFloat((1024 + Math.random() * 512).toFixed(2)),
      diskTotalMB: 20480,
    };
  }

  async getSlowQueries(thresholdMs: number): Promise<SlowQuery[]> {
    return [
      {
        queryText: 'SELECT * FROM ALL_OBJECTS WHERE OBJECT_TYPE = :1',
        durationMs: thresholdMs + 300,
        rowsReturned: 12000,
        indexUsed: null,
        executionPlan: { type: 'FULL TABLE SCAN', cost: 1200 },
      },
    ];
  }

  async executeQuery(sql: string): Promise<any[]> {
    console.log(`[OracleEngine] Simulated query: ${sql.substring(0, 80)}`);
    return [];
  }

  async killSession(sessionId: string): Promise<void> {
    console.log(`[OracleEngine] Simulated kill session: ${sessionId}`);
  }

  async measureReplicationLag(): Promise<number> {
    return parseFloat((Math.random() * 3).toFixed(3));
  }
}
