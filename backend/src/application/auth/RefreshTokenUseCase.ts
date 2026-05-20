import jwt from 'jsonwebtoken';

export class RefreshTokenUseCase {
  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number; username: string; role: string;
    };

    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return { accessToken };
  }
}
