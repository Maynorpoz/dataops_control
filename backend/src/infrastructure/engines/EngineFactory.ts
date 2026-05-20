import { IDatabaseEngine } from '../../domain/interfaces/IDatabaseEngine';
import { Connection } from '../../domain/entities/Connection';
import { AES256Service } from '../crypto/AES256Service';
import { PostgreSQLEngine } from './PostgreSQLEngine';
import { SQLServerEngine } from './SQLServerEngine';
import { OracleEngine } from './OracleEngine';
import { query } from '../database/PostgresConnection';

export class EngineFactory {
  static create(conn: Connection): IDatabaseEngine {
    const password = AES256Service.decrypt(conn.encrypted_password);
    const cfg = { host: conn.host, port: conn.port, database: conn.database_name, user: conn.user_name, password };

    switch (conn.motor) {
      case 'PostgreSQL': return new PostgreSQLEngine(cfg);
      case 'SQLServer':  return new SQLServerEngine(cfg);
      case 'Oracle':     return new OracleEngine(cfg);
      default:           throw new Error(`Unsupported engine: ${conn.motor}`);
    }
  }

  static async createById(connectionId: number): Promise<IDatabaseEngine> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error(`Connection ${connectionId} not found`);
    return EngineFactory.create(rows[0]);
  }
}
