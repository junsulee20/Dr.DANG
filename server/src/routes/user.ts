import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: 프로필 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: { message: '인증이 필요합니다.' },
      });
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116은 "no rows returned" 에러
      throw error;
    }

    res.json({
      profile: data || null,
    });
  } catch (error: any) {
    console.error('프로필 조회 오류:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 프로필 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *                 description: 나이
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: 성별
 *               height:
 *                 type: number
 *                 description: 키 (cm)
 *               weight:
 *                 type: number
 *                 description: 몸무게 (kg)
 *               diabetesType:
 *                 type: string
 *                 enum: [type1, type2, gestational, prediabetes]
 *                 description: 당뇨 유형
 *               targetCalories:
 *                 type: number
 *                 description: 목표 칼로리
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: { message: '인증이 필요합니다.' },
      });
    }

    const { age, gender, height, weight, diabetesType, targetCalories } = req.body;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    // 기존 프로필 확인
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let profile;
    if (existingProfile) {
      // 업데이트
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          age,
          gender,
          height,
          weight,
          diabetes_type: diabetesType,
          target_calories: targetCalories,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      profile = data;
    } else {
      // 생성
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          age,
          gender,
          height,
          weight,
          diabetes_type: diabetesType,
          target_calories: targetCalories,
        })
        .select()
        .single();

      if (error) throw error;
      profile = data;
    }

    res.json({
      profile,
    });
  } catch (error: any) {
    console.error('프로필 수정 오류:', error);
    next(error);
  }
});

export default router;

