import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { validateEnv } from './config/env';
import { swaggerSpec } from './config/swagger';

// 라우터 임포트
import authRouter from './routes/auth';
import foodRouter from './routes/food';
import recordsRouter from './routes/records';
import userRouter from './routes/user';
import testRouter from './routes/test';

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

