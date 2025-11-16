import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import axios from 'axios';
import { config } from '../config/env';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * @swagger
 * /auth/kakao:
 *   post:
 *     tags: [Auth]
 *     summary: 카카오 로그인
 *     description: 카카오 액세스 토큰으로 로그인하고 JWT 토큰을 발급받습니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kakaoAccessToken
 *             properties:
 *               kakaoAccessToken:
 *                 type: string
 *                 description: 카카오 OAuth 액세스 토큰
 *                 example: your_kakao_access_token_here
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT 액세스 토큰
 *                 refreshToken:
 *                   type: string
 *                   description: JWT 리프레시 토큰
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/kakao', async (req: Request, res: Response) => {
  try {
    const { kakaoAccessToken } = req.body;

    if (!kakaoAccessToken) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'kakaoAccessToken이 필요합니다.',
        },
      });
    }

    // 1. 카카오 사용자 정보 조회
    let kakaoUser;
    try {
      const kakaoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${kakaoAccessToken}`,
        },
      });
      kakaoUser = kakaoResponse.data;
    } catch (error: any) {
      console.error('Kakao API error:', error.response?.data || error.message);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: '유효하지 않은 카카오 액세스 토큰입니다.',
        },
      });
    }

    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@drdang.app`;
    const nickname = kakaoUser.kakao_account?.profile?.nickname || kakaoUser.properties?.nickname || '사용자';

    console.log('✅ 카카오 사용자 정보:', { kakaoId, email, nickname });

    // 2. Supabase에서 사용자 찾기 또는 생성
    let user: { id: string; name: string; email: string };

    // 먼저 kakao_id로 사용자 검색
    const { data: existingUsers, error: searchError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('kakao_id', kakaoId)
      .limit(1);

    if (searchError) {
      console.error('User search error:', searchError);
      throw new Error('사용자 검색 중 오류가 발생했습니다.');
    }

    if (existingUsers && existingUsers.length > 0) {
      // 기존 사용자
      user = existingUsers[0];
      console.log('✅ 기존 사용자 로그인:', user.id);
    } else {
      // 새 사용자 생성
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          kakao_id: kakaoId,
          email,
          name: nickname,
        })
        .select()
        .single();

      if (insertError) {
        console.error('User insert error:', insertError);
        throw new Error('사용자 생성 중 오류가 발생했습니다.');
      }

      user = newUser;
      console.log('✅ 새 사용자 생성:', user.id);
    }

    // 3. JWT 토큰 생성 (자체 JWT 사용, Supabase Auth 사용 안 함)
    const jwtPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt.secret, {
      expiresIn: '2h',
    });

    const refreshToken = jwt.sign({ sub: user.id, typ: 'refresh' }, config.jwt.secret, {
      expiresIn: '30d',
    });

    console.log('✅ JWT 토큰 발급 완료:', user.id);

    // 4. 응답 반환
    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Kakao login error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '로그인 처리 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

export default router;

