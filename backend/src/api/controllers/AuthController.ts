import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/auth/LoginUseCase';
import { LogoutUseCase } from '../../application/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../application/auth/RefreshTokenUseCase';
import { AuthRequest } from '../middlewares/authMiddleware';
import { query } from '../../infrastructure/database/PostgresConnection';

export class AuthController {
  private login = new LoginUseCase();
  private logout = new LogoutUseCase();
  private refresh = new RefreshTokenUseCase();

  handleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      if (!username || !password) { res.status(400).json({ error: 'username and password required' }); return; }

      const result = await this.login.execute(username, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken: result.accessToken, user: result.user });
    } catch (err: any) {
      if (err.message === 'Invalid credentials') { res.status(401).json({ error: err.message }); return; }
      next(err);
    }
  };

  handleLogout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) await this.logout.execute(token);
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out successfully' });
    } catch (err) { next(err); }
  };

  handleRefresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) { res.status(401).json({ error: 'Refresh token not found' }); return; }
      const result = await this.refresh.execute(refreshToken);
      res.json(result);
    } catch { res.status(401).json({ error: 'Invalid or expired refresh token' }); }
  };

  handleMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rows = await query('SELECT id, username, email, role, created_at FROM users WHERE id=$1', [req.user!.id]);
      res.json(rows[0]);
    } catch (err) { next(err); }
  };
}
