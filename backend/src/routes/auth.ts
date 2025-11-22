import axios from 'axios';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

interface BasicUser {
  id: string;
  email: string;
  name: string;
}

function issueTokens(user: BasicUser) {
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

  return { accessToken, refreshToken };
}

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
/**
 * @swagger
 * /auth/kakao/callback:
 *   get:
 *     tags: [Auth]
 *     summary: 카카오 OAuth 콜백
 *     description: 카카오 인증 후 리다이렉트되는 콜백 엔드포인트입니다. 모바일 앱에서 authorization code를 받기 위해 사용됩니다.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: 카카오 인증 코드
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: 에러 코드 (인증 실패 시)
 *     responses:
 *       200:
 *         description: 콜백 페이지 (HTML)
 */
router.get('/kakao/callback', (req: Request, res: Response) => {
  console.log('🔵 카카오 콜백 요청 받음');
  console.log('🔵 Query:', req.query);
  console.log('🔵 Headers:', req.headers);
  const { code, error } = req.query;

  if (error) {
    // 에러 발생 시 간단한 HTML 페이지 반환
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>카카오 로그인 오류</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .error {
              color: #d32f2f;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">카카오 로그인 오류</h1>
            <p>에러 코드: ${error}</p>
            <p>이 창을 닫아주세요.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>카카오 로그인 오류</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .error {
              color: #d32f2f;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">인증 코드를 받을 수 없습니다</h1>
            <p>이 창을 닫아주세요.</p>
          </div>
        </body>
      </html>
    `);
  }

  // 성공 시 간단한 HTML 페이지 반환
  // location.href로 같은 URL을 다시 로드하여 openAuthSessionAsync가 감지하도록 함
  // Expo Go에서도 작동할 수 있습니다
  const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>카카오 로그인 성공</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
          }
          .success {
            color: #2e7d32;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #FEE500;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          // location.href로 같은 URL을 다시 로드
          // openAuthSessionAsync가 이 URL 변경을 감지하여 앱으로 리다이렉트할 수 있습니다
          // 여러 번 시도하여 확실하게 감지되도록 함
          let attempts = 0;
          const maxAttempts = 3;
          
          function tryRedirect() {
            attempts++;
            console.log('리다이렉트 시도:', attempts);
            
            // 같은 URL로 리다이렉트 (이미 code가 포함되어 있음)
            window.location.href = '${currentUrl}';
            
            // 여러 번 시도
            if (attempts < maxAttempts) {
              setTimeout(tryRedirect, 500);
            }
          }
          
          // 즉시 시도
          setTimeout(tryRedirect, 100);
        </script>
      </head>
      <body>
        <div class="container">
          <h1 class="success">카카오 로그인 성공</h1>
          <div class="spinner"></div>
          <p>앱으로 돌아가는 중...</p>
        </div>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * /auth/email/login:
 *   post:
 *     tags: [Auth]
 *     summary: 이메일 로그인
 *     description: 이메일과 비밀번호로 로그인하고 JWT 토큰을 발급받습니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@drdang.app
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd!
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
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post('/email/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, height, weight } = req.body;

    if (!name || !email || !password || height === undefined || weight === undefined) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '이름, 이메일, 비밀번호, 키, 몸무게를 모두 입력해주세요.',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '이름을 올바르게 입력해주세요.',
        },
      });
    }

    const heightValue = parseInt(String(height), 10);
    const weightValue = parseInt(String(weight), 10);

    if (Number.isNaN(heightValue) || Number.isNaN(weightValue)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '키와 몸무게는 숫자로 입력해주세요.',
        },
      });
    }

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Email signup user fetch error:', existingUserError);
      throw new Error('이미 등록된 이메일인지 확인하는 중 오류가 발생했습니다.');
    }

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: '이미 사용 중인 이메일입니다.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        name: trimmedName,
        email: normalizedEmail,
        password_hash: passwordHash,
        height: heightValue,
        weight: weightValue,
      })
      .select('id, name, email')
      .single();

    if (insertError || !newUser) {
      console.error('Email signup insert error:', insertError);
      throw new Error('회원가입 처리 중 오류가 발생했습니다.');
    }

    const { accessToken, refreshToken } = issueTokens(newUser);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Email signup error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '회원가입 처리 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

router.post('/email/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '이메일과 비밀번호를 모두 입력해주세요.',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash')
      .eq('email', normalizedEmail)
      .single();

    if (error || !user) {
      console.error('Email login user fetch error:', error);
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        error: {
          code: 'PASSWORD_NOT_SET',
          message: '이메일 로그인 정보가 설정되지 않은 계정입니다. 카카오 로그인 또는 관리자에게 문의해주세요.',
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      });
    }

    const { accessToken, refreshToken } = issueTokens(user);

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
    console.error('Email login error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '로그인 처리 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
});

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
    const { accessToken, refreshToken } = issueTokens(user);

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

