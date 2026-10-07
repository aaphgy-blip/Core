import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message || err);

  const statusCode = err.statusCode || (err.message?.includes('no encontrado') ? 404 : 400);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor en Core V2',
  });
}
