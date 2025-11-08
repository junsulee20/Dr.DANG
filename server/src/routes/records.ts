import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticateSupabaseToken, SupabaseAuthRequest } from '../middleware/supabaseAuth';

const router = express.Router();

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: 식단 기록 조회
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: 식사 유형
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.get('/', authenticateSupabaseToken, async (req: SupabaseAuthRequest, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: { message: '인증이 필요합니다.' },
      });
    }

    const { date, mealType } = req.query;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    let query = supabaseAdmin
      .from('food_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);

      query = query
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString());
    }

    if (mealType) {
      query = query.eq('meal_type', mealType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      records: data || [],
    });
  } catch (error: any) {
    console.error('식단 기록 조회 오류:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: 식단 기록 생성
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *               - analyzedData
 *               - mealType
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: 이미지 URL
 *               analyzedData:
 *                 type: object
 *                 description: 분석된 음식 데이터
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 description: 식사 유형
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *                 description: 기록 시간 (선택사항)
 *     responses:
 *       201:
 *         description: 기록 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticateSupabaseToken, async (req: SupabaseAuthRequest, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: { message: '인증이 필요합니다.' },
      });
    }

    const { imageUrl, analyzedData, mealType, recordedAt } = req.body;

    if (!imageUrl || !analyzedData || !mealType) {
      return res.status(400).json({
        error: { message: '필수 필드가 누락되었습니다.' },
      });
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    const { data, error } = await supabaseAdmin
      .from('food_records')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        analyzed_data: analyzedData,
        meal_type: mealType,
        recorded_at: recordedAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      record: data,
    });
  } catch (error: any) {
    console.error('식단 기록 생성 오류:', error);
    next(error);
  }
});

export default router;

