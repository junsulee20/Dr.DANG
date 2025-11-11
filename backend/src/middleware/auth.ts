import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest } from '../types';

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '인증 토큰이 필요합니다.',
        },
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // JWT 토큰 검증
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // 요청 객체에 사용자 정보 추가
      req.user = {
        id: decoded.sub || decoded.userId || decoded.id,
        email: decoded.email || '',
      };

      next();
    } catch (jwtError: any) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '유효하지 않거나 만료된 토큰입니다.',
        },
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '인증 처리 중 오류가 발생했습니다.',
      },
    });
  }
}

