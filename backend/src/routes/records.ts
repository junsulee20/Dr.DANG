import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Records]
 *     summary: 식단 기록 조회
 *     description: 날짜별 또는 월별 식단 기록을 조회합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 특정 날짜 (YYYY-MM-DD)
 *         example: '2025-11-10'
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: 특정 월 (YYYY-MM)
 *         example: '2025-11'
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                     meals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MealRecord'
 *                 - type: object
 *                   properties:
 *                     month:
 *                       type: string
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MealRecord'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, month } = req.query;

    let query = supabaseAdmin
      .from('meal_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (date) {
      // 특정 날짜 조회
      query = query.eq('date', date as string);

      const { data, error } = await query;

      if (error) {
        console.error('Records fetch error:', error);
        throw new Error('기록 조회 중 오류가 발생했습니다.');
      }

      return res.json({
        date: date as string,
        meals: (data || []).map((record) => ({
          id: record.id,
          date: record.date,
          mealType: record.meal_type,
          foodName: record.food_name,
          imageUrl: record.image_url,
          nutrition: record.nutrition,
          detailedNutrition: record.detailed_nutrition,
          expectedGlucoseRise: record.expected_glucose_rise,
          recommendations: record.recommendations,
          analysisResult: record.analysis_result,
          createdAt: record.created_at,
        })),
      });
    } else if (month) {
      // 월별 조회
      const monthStr = month as string;
      console.log('🔵 월별 조회 시작:', monthStr);
      
      const [year, monthNum] = monthStr.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(monthNum);
      
      // 해당 월의 마지막 날짜 계산
      const lastDay = new Date(yearInt, monthInt, 0).getDate();
      
      const startDate = `${year}-${monthNum.padStart(2, '0')}-01`;
      const endDate = `${year}-${monthNum.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      
      console.log('🔵 날짜 범위:', startDate, '~', endDate);

      query = query.gte('date', startDate).lte('date', endDate);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Records fetch error:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', JSON.stringify(error, null, 2));
        throw new Error('기록 조회 중 오류가 발생했습니다.');
      }

      console.log('✅ 기록 조회 성공:', data?.length || 0, '개');

      return res.json({
        month: monthStr,
        records: (data || []).map((record) => ({
          id: record.id,
          date: record.date,
          mealType: record.meal_type,
          foodName: record.food_name,
          imageUrl: record.image_url,
          nutrition: record.nutrition,
          detailedNutrition: record.detailed_nutrition,
          expectedGlucoseRise: record.expected_glucose_rise,
          recommendations: record.recommendations,
          analysisResult: record.analysis_result,
          createdAt: record.created_at,
        })),
      });
    } else {
      // 파라미터 없으면 최근 30일 기록 반환
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      query = query.gte('date', startDate);

      const { data, error } = await query;

      if (error) {
        console.error('Records fetch error:', error);
        throw new Error('기록 조회 중 오류가 발생했습니다.');
      }

      return res.json({
        records: data || [],
      });
    }
  } catch (error: any) {
    console.error('❌ Get records error:', error);
    console.error('에러 스택:', error.stack);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '기록 조회 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/records:
 *   post:
 *     tags: [Records]
 *     summary: 식단 기록 생성
 *     description: 새로운 식단 기록을 생성합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mealType
 *               - foodName
 *               - imageUrl
 *               - analysisResult
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2025-11-10'
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner]
 *                 example: lunch
 *               foodName:
 *                 type: string
 *                 example: 김치찌개
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/food.jpg
 *               analysisResult:
 *                 type: object
 *                 description: /api/food/analyze의 응답 전체
 *     responses:
 *       200:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, mealType, foodName, imageUrl, analysisResult } = req.body;

    // 필수 필드 검증
    if (!date || !mealType || !foodName || !imageUrl || !analysisResult) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '필수 필드가 누락되었습니다.',
        },
      });
    }

    // mealType 검증
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'mealType은 breakfast, lunch, dinner 중 하나여야 합니다.',
        },
      });
    }

    // 기록 생성
    const { data, error } = await supabaseAdmin
      .from('meal_records')
      .insert({
        user_id: userId,
        date,
        meal_type: mealType,
        food_name: foodName,
        image_url: imageUrl,
        expected_glucose_rise: analysisResult.expectedGlucoseRise,
        nutrition: analysisResult.nutrition,
        detailed_nutrition: analysisResult.detailedNutrition,
        recommendations: analysisResult.recommendations,
        analysis_result: analysisResult,
      })
      .select()
      .single();

    if (error) {
      console.error('Record insert error:', error);
      throw new Error('기록 생성 중 오류가 발생했습니다.');
    }

    return res.json({
      id: data.id,
      message: 'Record created successfully',
    });
  } catch (error: any) {
    console.error('Create record error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '기록 생성 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: 식단 기록 삭제
 *     description: 특정 식단 기록을 삭제합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 기록 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 기록을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // 본인의 기록인지 확인 후 삭제
    const { data, error } = await supabaseAdmin
      .from('meal_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: '기록을 찾을 수 없습니다.',
          },
        });
      }

      console.error('Record delete error:', error);
      throw new Error('기록 삭제 중 오류가 발생했습니다.');
    }

    return res.json({
      message: 'Record deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete record error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '기록 삭제 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

export default router;

