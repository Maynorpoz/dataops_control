import { IDatabaseEngine } from '../../domain/interfaces/IDatabaseEngine';
import { Connection } from '../../domain/entities/Connection';
import { AES256Service } from '../crypto/AES256Service';
import { PostgreSQLEngine } from './PostgreSQLEngine';
import { SQLServerEngine } from './SQLServerEngine';
import { OracleEngine } from './OracleEngine';
import { query } from '../database/PostgresConnection';

export class EngineFactory {
  // Registry keyed by connection ID — reuses pools across HealthCheck cycles
  private static registry = new Map<number, IDatabaseEngine>();

  static create(conn: Connection): IDatabaseEngine {
    const password = AES256Service.decrypt(conn.encrypted_password);
    const cfg = {
      host:     conn.host,
      port:     conn.port,
      database: conn.database_name,
      user:     conn.user_name,
      password,
    };

    switch (conn.motor) {
      case 'PostgreSQL': return new PostgreSQLEngine(cfg);
      case 'SQLServer':  return new SQLServerEngine(cfg);
      case 'Oracle':     return new OracleEngine(cfg);
      default:           throw new Error(`Motor no soportado: ${conn.motor}`);
    }
  }

  // Returns the cached engine for the connection ID, creating it only once.
  // This ensures PostgreSQL pools, SQL Server pools and Oracle pools
  // are reused across the HealthCheck cron cycles instead of leaking.
  static async createById(connectionId: number): Promise<IDatabaseEngine> {
    if (this.registry.has(connectionId)) {
      return this.registry.get(connectionId)!;
    }

    const rows = await query<Connection>(
      'SELECT * FROM connections WHERE id = $1',
      [connectionId]
    );
    if (!rows.length) throw new Error(`Conexión ${connectionId} no encontrada.`);

    const engine = EngineFactory.create(rows[0]);
    this.registry.set(connectionId, engine);
    return engine;
  }

  // Call when a connection is deleted or its credentials change
  // so the stale pool is removed and a fresh one is created next time.
  static evict(connectionId: number): void {
    this.registry.delete(connectionId);
    console.log(`[EngineFactory] Pool evicted for connection ${connectionId}`);
  }
}
