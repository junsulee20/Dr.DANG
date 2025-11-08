import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dr.DANG API',
      version: '1.0.0',
      description: 'Dr.DANG 백엔드 API 문서',
      contact: {
        name: 'Dr.DANG Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: '로컬 개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // Swagger 주석이 있는 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);

