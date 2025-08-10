// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Finger Snap API',
            version: '1.0.0',
            description:
                'A REST API for the Finger Snap photo sharing service, built with Express and Prisma.',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3001}/api`,
                description: 'Development server',
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
    // API 명세가 작성된 파일 경로
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // 라우트와 모델(스키마) 파일 지정
};

export const specs = swaggerJsdoc(options);