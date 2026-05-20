import { query } from '../../infrastructure/database/PostgresConnection';
import { AES256Service } from '../../infrastructure/crypto/AES256Service';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { Connection } from '../../domain/entities/Connection';

export class UpdateConnectionUseCase {
  async execute(id: number, data: Partial<{
    nombre: string; host: string; port: number; database_name: string;
    user_name: string; password: string; status: string;
  }>): Promise<Connection> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.nombre)        { fields.push(`nombre=$${idx++}`);         values.push(data.nombre); }
    if (data.host)          { fields.push(`host=$${idx++}`);           values.push(data.host); }
    if (data.port)          { fields.push(`port=$${idx++}`);           values.push(data.port); }
    if (data.database_name) { fields.push(`database_name=$${idx++}`);  values.push(data.database_name); }
    if (data.user_name)     { fields.push(`user_name=$${idx++}`);      values.push(data.user_name); }
    if (data.password)      { fields.push(`encrypted_password=$${idx++}`); values.push(AES256Service.encrypt(data.password)); }
    if (data.status)        { fields.push(`status=$${idx++}`);         values.push(data.status); }

    fields.push(`updated_at=NOW()`);
    values.push(id);

    const rows = await query<Connection>(
      `UPDATE connections SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    );

    await RedisService.invalidatePattern('cache:connections:*');
    return rows[0];
  }
}
