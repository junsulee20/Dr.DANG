import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase';
import { analyzeFoodImage } from '../services/openai';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  },
});

/**
 * @swagger
 * /api/food/analyze:
 *   post:
 *     summary: 음식 이미지 분석
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 분석할 음식 이미지 파일
 *     responses:
 *       200:
 *         description: 분석 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   description: 업로드된 이미지 URL
 *                 analyzedData:
 *                   type: object
 *                   properties:
 *                     foods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           quantity:
 *                             type: string
 *                           calories:
 *                             type: number
 *                           carbs:
 *                             type: number
 *                           protein:
 *                             type: number
 *                           fat:
 *                             type: number
 *                     totalCalories:
 *                       type: number
 *                     totalCarbs:
 *                       type: number
 *                     totalProtein:
 *                       type: number
 *                     totalFat:
 *                       type: number
 *       400:
 *         description: 잘못된 요청 (이미지 파일 없음)
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.post('/analyze', authenticateToken, upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: '이미지 파일이 필요합니다.' },
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: { message: '인증이 필요합니다.' },
      });
    }

    // 1. 이미지를 Supabase Storage에 업로드
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client가 설정되지 않았습니다.');
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('food-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 2. 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('food-images').getPublicUrl(fileName);

    // 3. OpenAI를 사용하여 이미지 분석
    const analyzedData = await analyzeFoodImage(req.file.buffer, req.file.mimetype);

    // 4. 분석 결과 반환
    res.json({
      imageUrl: publicUrl,
      analyzedData,
    });
  } catch (error: any) {
    console.error('음식 분석 오류:', error);
    next(error);
  }
});

export default router;

