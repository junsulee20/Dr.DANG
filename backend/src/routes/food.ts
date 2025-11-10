import { Router, Response } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { analyzeFood } from '../services/foodAnalysis';
import * as fs from 'fs';

const router = Router();

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  },
});

/**
 * @swagger
 * /api/food/analyze:
 *   post:
 *     tags: [Food]
 *     summary: 음식 사진 분석
 *     description: 음식 사진을 업로드하여 GPT-4 Vision으로 분석하고 영양 정보와 당뇨 조언을 받습니다
 *     security:
 *       - BearerAuth: []
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
 *                 description: 음식 이미지 파일 (최대 10MB)
 *     responses:
 *       200:
 *         description: 분석 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodAnalysisResult'
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
 *       503:
 *         description: GPT API 서비스 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/analyze',
  authMiddleware,
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: '이미지 파일이 필요합니다.',
          },
        });
      }

      const userId = req.user!.id;

      // 1. 이미지를 Supabase Storage에 업로드
      const fileName = `${userId}/${Date.now()}_${req.file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('food-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: '이미지 업로드 중 오류가 발생했습니다.',
            details: uploadError.message,
          },
        });
      }

      // 2. 업로드된 이미지의 공개 URL 가져오기
      const { data: urlData } = supabaseAdmin.storage
        .from('food-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 3. 이미지를 base64로 변환
      const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // 4. GPT API로 음식 분석
      const analysisResult = await analyzeFood(imageBase64, imageUrl);

      // 5. 결과 반환
      return res.json(analysisResult);
    } catch (error: any) {
      console.error('Food analysis error:', error);

      if (error.message.includes('음식 분석 실패')) {
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'GPT API 서비스 오류입니다.',
            details: error.message,
          },
        });
      }

      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: '음식 분석 중 오류가 발생했습니다.',
          details: error.message,
        },
      });
    }
  }
);

export default router;

