import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateConnectionUseCase } from '../../application/connections/CreateConnectionUseCase';
import { UpdateConnectionUseCase } from '../../application/connections/UpdateConnectionUseCase';
import { DeleteConnectionUseCase } from '../../application/connections/DeleteConnectionUseCase';
import { TestConnectionUseCase } from '../../application/connections/TestConnectionUseCase';
import { query } from '../../infrastructure/database/PostgresConnection';
import { RedisService } from '../../infrastructure/cache/RedisService';

export class ConnectionsController {
  private create = new CreateConnectionUseCase();
  private update = new UpdateConnectionUseCase();
  private delete = new DeleteConnectionUseCase();
  private test   = new TestConnectionUseCase();

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await RedisService.getCached('cache:connections:all', () =>
        query(`SELECT id,nombre,motor,host,port,database_name,user_name,status,health_status,last_checked_at,created_at
               FROM connections ORDER BY id`),
        60
      );
      res.json(data);
    } catch (err) { next(err); }
  };

  getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rows = await query(
        `SELECT id,nombre,motor,host,port,database_name,user_name,status,health_status,last_checked_at FROM connections WHERE id=$1`,
        [req.params.id]
      );
      if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(rows[0]);
    } catch (err) { next(err); }
  };

  createOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.create.execute(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  };

  updateOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.update.execute(parseInt(req.params.id), req.body);
      res.json(result);
    } catch (err) { next(err); }
  };

  deleteOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.delete.execute(parseInt(req.params.id));
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  };

  testOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.test.execute(parseInt(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  };
}
