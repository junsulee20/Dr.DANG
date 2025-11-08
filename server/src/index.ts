// 환경 변수를 가장 먼저 로드
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth';
import foodRoutes from './routes/food';
import recordsRoutes from './routes/records';
import userRoutes from './routes/user';
import testRoutes from './routes/test';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: 서버 상태 확인
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버가 정상적으로 실행 중입니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Dr.DANG Backend API is running
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dr.DANG Backend API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/user', userRoutes);

// Test routes (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  app.use('/test', testRoutes);
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

