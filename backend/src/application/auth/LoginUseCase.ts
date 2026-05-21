import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../infrastructure/database/PostgresConnection';
import { User } from '../../domain/entities/User';

export class LoginUseCase {
  async execute(username: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const rows = await query<User>(
      "SELECT * FROM users WHERE username = $1 AND is_active = TRUE",
      [username]
    );

    if (!rows.length) throw new Error('Invalid credentials');

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const payload = { id: user.id, username: user.username, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }
}
