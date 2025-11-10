import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const router = Router();

// 개발 환경에서만 사용 가능하도록 체크
const isDevelopment = config.server.nodeEnv === 'development';

if (!isDevelopment) {
  // 프로덕션에서는 테스트 API 비활성화
  router.all('*', (req: Request, res: Response) => {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: '테스트 API는 개발 환경에서만 사용 가능합니다.',
      },
    });
  });
}

/**
 * @swagger
 * /api/test/create-user:
 *   post:
 *     tags: [Test]
 *     summary: 테스트 사용자 생성 (개발 환경 전용)
 *     description: Swagger 테스트를 위한 임시 사용자를 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 default: 테스트 유저
 *               email:
 *                 type: string
 *                 default: test@drdang.app
 *               height:
 *                 type: number
 *                 default: 175
 *               weight:
 *                 type: number
 *                 default: 70
 *     responses:
 *       200:
 *         description: 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     height:
 *                       type: number
 *                     weight:
 *                       type: number
 *                 token:
 *                   type: string
 *                   description: JWT 토큰 (바로 사용 가능)
 *                 message:
 *                   type: string
 */
router.post('/create-user', async (req: Request, res: Response) => {
  try {
    const {
      name = '테스트 유저',
      email = `test_${Date.now()}@drdang.app`,
      height = 175,
      weight = 70,
    } = req.body;

    // 사용자 생성
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        kakao_id: `test_kakao_${Date.now()}`,
        name,
        email,
        height,
        weight,
      })
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      throw new Error('사용자 생성 중 오류가 발생했습니다.');
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        aud: 'authenticated',
        role: 'authenticated',
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
      },
      token,
      message: '✅ 테스트 사용자가 생성되었습니다. 위의 token을 복사하여 Authorize 버튼에 입력하세요.',
    });
  } catch (error: any) {
    console.error('Test user creation error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '테스트 사용자 생성 실패',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/test/generate-token:
 *   post:
 *     tags: [Test]
 *     summary: JWT 토큰 생성 (개발 환경 전용)
 *     description: 기존 사용자 ID로 JWT 토큰을 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: 사용자 UUID
 *     responses:
 *       200:
 *         description: 토큰 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.post('/generate-token', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId가 필요합니다.',
        },
      });
    }

    // 사용자 조회
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.',
        },
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        aud: 'authenticated',
        role: 'authenticated',
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: '✅ JWT 토큰이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('Token generation error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '토큰 생성 실패',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/test/users:
 *   get:
 *     tags: [Test]
 *     summary: 모든 사용자 조회 (개발 환경 전용)
 *     description: 데이터베이스의 모든 사용자를 조회합니다
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: number
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('사용자 조회 중 오류가 발생했습니다.');
    }

    return res.json({
      users: users || [],
      count: users?.length || 0,
    });
  } catch (error: any) {
    console.error('Users fetch error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '사용자 조회 실패',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/test/records:
 *   get:
 *     tags: [Test]
 *     summary: 모든 식단 기록 조회 (개발 환경 전용)
 *     description: 데이터베이스의 모든 식단 기록을 조회합니다
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get('/records', async (req: Request, res: Response) => {
  try {
    const { data: records, error } = await supabaseAdmin
      .from('meal_records')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('기록 조회 중 오류가 발생했습니다.');
    }

    return res.json({
      records: records || [],
      count: records?.length || 0,
    });
  } catch (error: any) {
    console.error('Records fetch error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '기록 조회 실패',
        details: error.message,
      },
    });
  }
});

export default router;

