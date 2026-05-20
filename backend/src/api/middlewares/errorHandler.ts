import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  const status = (err as any).status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
}
