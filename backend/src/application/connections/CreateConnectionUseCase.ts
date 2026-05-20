import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { Connection } from '../../domain/entities/Connection';

export class CreateConnectionUseCase {
  async execute(data: {
    nombre: string; motor: string; host: string; port: number;
    database_name: string; user_name: string; password: string;
  }): Promise<Connection> {
    const encryptedPassword = AES256Service.encrypt(data.password);

    const rows = await query<Connection>(
      `INSERT INTO connections (nombre, motor, host, port, database_name, user_name, encrypted_password)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.nombre, data.motor, data.host, data.port, data.database_name, data.user_name, encryptedPassword]
    );

    await RedisService.invalidatePattern('cache:connections:*');
    return rows[0];
  }
}
