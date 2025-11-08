import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = express.Router();

/**
 * @swagger
 * /auth/kakao:
 *   post:
 *     summary: 카카오 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: 카카오 액세스 토큰
 *                 example: "kakao_access_token_here"
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *                     email:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/kakao', async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: { message: '카카오 accessToken이 필요합니다.' },
      });
    }

    // 카카오 사용자 정보 조회
    const kakaoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakaoUser = kakaoResponse.data;
    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email;
    const nickname = kakaoUser.kakao_account?.profile?.nickname;
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url;

    // Supabase에서 사용자 조회 또는 생성
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    // 기존 사용자 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('kakao_id', kakaoId)
      .single();

    let user;
    if (existingUser) {
      // 기존 사용자 업데이트
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email,
          nickname,
          profile_image: profileImage,
          updated_at: new Date().toISOString(),
        })
        .eq('kakao_id', kakaoId)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      // 새 사용자 생성
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          kakao_id: kakaoId,
          email,
          nickname,
          profile_image: profileImage,
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET이 설정되지 않았습니다.');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profile_image,
      },
      token,
    });
  } catch (error: any) {
    console.error('카카오 로그인 오류:', error);
    next(error);
  }
});

export default router;

