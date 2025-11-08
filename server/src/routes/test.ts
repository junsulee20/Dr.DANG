import express from 'express';
import { supabaseAdmin } from '../config/supabase';
import { createTestUserAndToken, deleteTestUser } from '../utils/testHelpers';

const router = express.Router();

/**
 * @swagger
 * /test/health:
 *   get:
 *     summary: 테스트용 헬스 체크
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '테스트 엔드포인트가 정상 작동합니다',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /test/supabase:
 *   get:
 *     summary: Supabase 연결 테스트
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Supabase 연결 성공
 *       500:
 *         description: Supabase 연결 실패
 */
router.get('/supabase', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: { message: 'Supabase admin client가 설정되지 않았습니다.' },
      });
    }

    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      status: 'ok',
      message: 'Supabase 연결 성공',
      data: {
        connection: 'success',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Supabase 연결 테스트 오류:', error);
    next(error);
  }
});

/**
 * @swagger
 * /test/user/create:
 *   post:
 *     summary: 테스트용 사용자 생성 및 토큰 발급
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: 테스트 사용자 생성 성공
 */
router.post('/user/create', async (req, res, next) => {
  try {
    const { user, token } = await createTestUserAndToken();

    res.json({
      status: 'ok',
      message: '테스트 사용자 생성 성공',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        },
        token,
        note: '이 토큰을 Authorization 헤더에 Bearer {token} 형식으로 사용하세요',
      },
    });
  } catch (error: any) {
    console.error('테스트 사용자 생성 오류:', error);
    next(error);
  }
});

/**
 * @swagger
 * /test/db/insert:
 *   post:
 *     summary: 데이터베이스에 테스트 데이터 삽입
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 ID (선택사항, 없으면 테스트 사용자 생성)
 *     responses:
 *       200:
 *         description: 데이터 삽입 성공
 */
router.post('/db/insert', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    let userId = req.body.userId;

    // userId가 없으면 테스트 사용자 생성
    if (!userId) {
      const { user } = await createTestUserAndToken();
      userId = user.id;
    }

    // 테스트용 프로필 데이터 삽입
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        age: 30,
        gender: 'male',
        height: 175.5,
        weight: 70.0,
        diabetes_type: 'type2',
        target_calories: 2000,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // 테스트용 식단 기록 삽입
    const { data: record, error: recordError } = await supabaseAdmin
      .from('food_records')
      .insert({
        user_id: userId,
        image_url: 'https://example.com/test-image.jpg',
        analyzed_data: {
          foods: [
            {
              name: '테스트 음식',
              quantity: '1인분',
              calories: 500,
              carbs: 60,
              protein: 20,
              fat: 15,
            },
          ],
          totalCalories: 500,
          totalCarbs: 60,
          totalProtein: 20,
          totalFat: 15,
        },
        meal_type: 'lunch',
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (recordError) throw recordError;

    res.json({
      status: 'ok',
      message: '테스트 데이터 삽입 성공',
      data: {
        userId,
        profile,
        record,
      },
    });
  } catch (error: any) {
    console.error('데이터 삽입 오류:', error);
    next(error);
  }
});

/**
 * @swagger
 * /test/db/query:
 *   get:
 *     summary: 데이터베이스에서 데이터 조회 테스트
 *     tags: [Test]
 *     parameters:
 *       - in: query
 *         name: table
 *         schema:
 *           type: string
 *           enum: [users, user_profiles, food_records]
 *         description: 조회할 테이블
 *     responses:
 *       200:
 *         description: 데이터 조회 성공
 */
router.get('/db/query', async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    const table = req.query.table as string || 'users';
    const limit = parseInt(req.query.limit as string) || 5;

    let query = supabaseAdmin.from(table).select('*').limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      status: 'ok',
      message: `테이블 ${table} 조회 성공`,
      data: {
        table,
        count: data?.length || 0,
        records: data,
      },
    });
  } catch (error: any) {
    console.error('데이터 조회 오류:', error);
    next(error);
  }
});

export default router;

