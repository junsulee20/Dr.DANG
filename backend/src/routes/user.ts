import { Router, Response } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: 사용자 프로필 조회
 *     description: 현재 로그인한 사용자의 프로필 정보를 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 height:
 *                   type: number
 *                   description: 키 (cm)
 *                 weight:
 *                   type: number
 *                   description: 몸무게 (kg)
 *                 profileImageUrl:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);

      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
        });
      }

      throw new Error('프로필 조회 중 오류가 발생했습니다.');
    }

    return res.json({
      id: data.id,
      name: data.name,
      email: data.email,
      height: data.height,
      weight: data.weight,
      profileImageUrl: data.profile_image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '프로필 조회 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     tags: [User]
 *     summary: 사용자 프로필 수정
 *     description: 현재 로그인한 사용자의 프로필 정보를 수정합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 이름
 *                 example: 홍길동
 *               height:
 *                 type: number
 *                 description: 키 (cm)
 *                 example: 175
 *               weight:
 *                 type: number
 *                 description: 몸무게 (kg)
 *                 example: 70
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: 프로필 이미지 파일 (최대 5MB)
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
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
 *                     profileImageUrl:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/profile',
  authMiddleware,
  upload.single('profileImage'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, height, weight } = req.body;

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (name) updateData.name = name;
      if (height) updateData.height = parseInt(height, 10);
      if (weight) updateData.weight = parseInt(weight, 10);

      // 프로필 이미지 업로드
      if (req.file) {
        const fileName = `${userId}/profile_${Date.now()}_${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('food-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error('Profile image upload error:', uploadError);
          throw new Error('프로필 이미지 업로드 중 오류가 발생했습니다.');
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('food-images')
          .getPublicUrl(fileName);

        updateData.profile_image_url = urlData.publicUrl;
      }

      // 프로필 업데이트
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw new Error('프로필 수정 중 오류가 발생했습니다.');
      }

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          height: data.height,
          weight: data.weight,
          profileImageUrl: data.profile_image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: '프로필 수정 중 오류가 발생했습니다.',
          details: error.message,
        },
      });
    }
  }
);

export default router;

