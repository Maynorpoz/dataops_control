import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs';
import sql from 'mssql';
import oracledb from 'oracledb';
import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { CloudUploadWorker } from '../../infrastructure/workers/CloudUploadWorker';
import { Connection } from '../../domain/entities/Connection';
import { BackupHistory } from '../../domain/entities/BackupHistory';

const execAsync = promisify(exec);

async function oracleExport(conn: Connection, filePath: string, backupType: string): Promise<void> {
  const connection = await oracledb.getConnection({
    user: conn.user_name,
    password: AES256Service.decrypt(conn.encrypted_password),
    connectString: `${conn.host}:${conn.port}/${conn.database_name}`,
  });
  try {
    const tablesRes = await connection.execute<[string]>(
      `SELECT table_name FROM user_tables ORDER BY table_name`,
      [], { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    const backup: Record<string, any> = {
      __metadata: { database: conn.database_name, server: conn.host, exportedAt: new Date().toISOString(), backupType, motor: 'Oracle' },
      tables: {},
    };
    for (const row of (tablesRes.rows || [])) {
      const tableName = row[0];
      try {
        const dataRes = await connection.execute(`SELECT * FROM "${tableName}"`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        backup.tables[tableName] = dataRes.rows || [];
      } catch { backup.tables[tableName] = []; }
    }
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
  } finally {
    await connection.close();
  }
}

async function sqlServerExport(conn: Connection, filePath: string, backupType: string): Promise<void> {
  const pool = await sql.connect({
    server: conn.host,
    port: conn.port,
    database: conn.database_name,
    user: conn.user_name,
    password: AES256Service.decrypt(conn.encrypted_password),
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
    connectionTimeout: 30000,
  });

  try {
    const tablesRes = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);

    const backup: Record<string, any> = {
      __metadata: {
        database: conn.database_name,
        server: conn.host,
        exportedAt: new Date().toISOString(),
        backupType,
        motor: 'SQLServer',
      },
      tables: {},
    };

    for (const row of tablesRes.recordset) {
      const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`;
      try {
        const data = await pool.request()
          .query(`SELECT * FROM [${row.TABLE_SCHEMA}].[${row.TABLE_NAME}]`);
        backup.tables[key] = data.recordset;
      } catch {
        backup.tables[key] = [];
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
  } finally {
    await pool.close();
  }
}

export class ExecuteIncrementalBackupUseCase {
  async execute(connectionId: number): Promise<BackupHistory> {
    const rows = await query<Connection>('SELECT * FROM connections WHERE id = $1', [connectionId]);
    if (!rows.length) throw new Error('Connection not found');
    const conn = rows[0];

    const [parent] = await query<BackupHistory>(
      `SELECT * FROM backup_history
       WHERE db_id = $1 AND backup_type IN ('FULL','DIFF') AND status = 'SUCCESS'
       ORDER BY created_at DESC LIMIT 1`,
      [connectionId]
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const storagePath = process.env.BACKUP_STORAGE_PATH || '/backups';
    const safeName = conn.nombre.replace(/\s+/g, '_');
    const ext = conn.motor === 'PostgreSQL' ? 'pgdump' : 'json';
    const filePath = `${storagePath}/${safeName}_INC_${timestamp}.${ext}`;

    const [pending] = await query<BackupHistory>(
      `INSERT INTO backup_history (db_id, backup_type, parent_id, status, restore_point)
       VALUES ($1,'INC',$2,'RUNNING',NOW()) RETURNING *`,
      [connectionId, parent?.id || null]
    );

    const startTime = Date.now();
    try {
      if (conn.motor === 'PostgreSQL') {
        const password = AES256Service.decrypt(conn.encrypted_password);
        await execAsync(
          `pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user_name} -d ${conn.database_name} -F c -f "${filePath}"`,
          { env: { ...process.env, PGPASSWORD: password } }
        );
      } else if (conn.motor === 'SQLServer') {
        await sqlServerExport(conn, filePath, 'INC');
      } else if (conn.motor === 'Oracle') {
        await oracleExport(conn, filePath, 'INC');
      } else {
        throw new Error(`Backup no soportado para motor ${conn.motor}`);
      }

      const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      const stats = fs.statSync(filePath);
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

      const [backup] = await query<BackupHistory>(
        `UPDATE backup_history SET status='SUCCESS', file_path=$1, file_size_mb=$2, file_hash=$3, duration_seconds=$4
         WHERE id=$5 RETURNING *`,
        [filePath, (stats.size / 1024 / 1024).toFixed(2), hash, durationSeconds, pending.id]
      );

      CloudUploadWorker.enqueue(backup.id).catch(console.error);
      await RedisService.invalidatePattern('cache:backup:*');
      return backup;
    } catch (error) {
      await query(`UPDATE backup_history SET status='FAILED', error_message=$1 WHERE id=$2`, [String(error), pending.id]);
      throw error;
    }
  }
}
