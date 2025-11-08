import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * JWT 토큰 인증 미들웨어
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: { message: '인증 토큰이 필요합니다.' },
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      error: { message: '서버 설정 오류' },
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({
      error: { message: '유효하지 않은 토큰입니다.' },
    });
  }
}

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        req.userId = decoded.userId;
      } catch (error) {
        // 토큰이 유효하지 않아도 통과
      }
    }
  }

  next();
}

