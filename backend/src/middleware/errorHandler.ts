import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || '서버 오류가 발생했습니다.';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      details: err.details || {},
    },
  });
}

