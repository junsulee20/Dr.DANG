import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dr. DANG API',
      version: '1.0.0',
      description: '당뇨 관리 앱 Dr. DANG의 백엔드 API 문서',
      contact: {
        name: 'Dr. DANG Team',
        email: 'support@drdang.app',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 입력하세요 (Bearer 제외)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
                message: {
                  type: 'string',
                  example: '에러 메시지',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
          },
        },
        FoodAnalysisResult: {
          type: 'object',
          properties: {
            foodName: {
              type: 'string',
              example: '고기국수',
            },
            expectedGlucoseRise: {
              type: 'number',
              example: 60,
            },
            actionGuide: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            nutrition: {
              type: 'object',
              properties: {
                carbs: { type: 'number', example: 102 },
                protein: { type: 'number', example: 30 },
                fat: { type: 'number', example: 20 },
              },
            },
            detailedNutrition: {
              type: 'object',
              properties: {
                calories: { type: 'number', example: 500 },
                fat: { type: 'number', example: 20 },
                sodium: { type: 'number', example: 800 },
                sugar: { type: 'number', example: 15 },
                ratio: { type: 'number', example: 75 },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            analysisResult: {
              type: 'object',
              properties: {
                canRise: { type: 'boolean' },
                warning: { type: 'string' },
              },
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
          },
        },
        MealRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2025-11-10',
            },
            mealType: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner'],
            },
            foodName: {
              type: 'string',
            },
            imageUrl: {
              type: 'string',
            },
            nutrition: {
              type: 'object',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Test',
        description: '🧪 테스트용 API (개발 환경 전용)',
      },
      {
        name: 'Auth',
        description: '인증 관련 API',
      },
      {
        name: 'Food',
        description: '음식 분석 API',
      },
      {
        name: 'Records',
        description: '식단 기록 API',
      },
      {
        name: 'User',
        description: '사용자 프로필 API',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // API 라우터 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);

