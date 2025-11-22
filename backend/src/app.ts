import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { validateEnv } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

// 라우터 임포트
import authRouter from './routes/auth';
import foodRouter from './routes/food';
import recordsRouter from './routes/records';
import testRouter from './routes/test';
import userRouter from './routes/user';

// 환경 변수 검증
validateEnv();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Universal Link 설정 파일 (iOS)
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAM_ID.com.drdang.app', // TEAM_ID는 Apple Developer Team ID로 교체 필요
          paths: ['/auth/kakao/callback*'],
        },
      ],
    },
  });
});

// App Link 설정 파일 (Android)
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.drdang.app',
        sha256_cert_fingerprints: [
          // SHA-256 지문은 나중에 실제 앱 서명 인증서로 교체 필요
          'PLACEHOLDER_SHA256_FINGERPRINT',
        ],
      },
    },
  ]);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Dr. DANG API',
}));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API 라우트
app.use('/auth', authRouter);
app.use('/api/food', foodRouter);
app.use('/api/records', recordsRouter);
app.use('/api/user', userRouter);
app.use('/api/test', testRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.',
    },
  });
});

// 에러 핸들러
app.use(errorHandler);

export default app;

