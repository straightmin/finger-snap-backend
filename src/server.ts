// src/server.ts
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger'; // Swagger 설정 임포트
import config from './config'; // 중앙 설정 파일 임포트
import authRoutes from './routes/auth.routes';
import photoRoutes from './routes/photo.routes';
import likeRoutes from './routes/like.routes';
import commentRoutes from './routes/comment.routes';
import followRoutes from './routes/follow.routes';
import collectionRoutes from './routes/collection.routes'; // 추가
import seriesRoutes from './routes/series.routes';
import notificationRoutes from './routes/notification.routes';
import imageRoutes from './routes/image.routes';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/user.routes';
import { setLanguage } from './middlewares/language.middleware';

// Express 애플리케이션을 생성합니다.
const app = express();

// CORS 설정 - 프론트엔드와의 통신을 위해 필수
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Next.js 개발 서버
    credentials: true, // 인증 헤더 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

// 개발 환경에서만 Swagger UI를 활성화합니다.
if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// JSON 요청 본문을 파싱하기 위한 미들웨어를 추가합니다.
app.use(express.json());

// 언어 설정 미들웨어 적용
app.use(setLanguage);

// 사용자 관련 라우트를 /api/users 경로에 등록합니다.
app.use('/api/users', userRoutes);

// 인증 관련 라우트를 /api/auth 경로에 등록합니다.
app.use('/api/auth', authRoutes);

// 댓글 관련 라우트를 /api/photos 경로에 등록합니다.
// photoRoutes보다 먼저 등록해야 라우팅 충돌을 방지할 수 있습니다.
app.use('/api', commentRoutes);

// 사진 관련 라우트를 /api/photos 경로에 등록합니다.
app.use('/api/photos', photoRoutes);

// 컬렉션 관련 라우트를 /api/collections 경로에 등록합니다.
app.use('/api/collections', collectionRoutes);

// 시리즈 관련 라우트를 /api/series 경로에 등록합니다.
app.use('/api/series', seriesRoutes);

// 좋아요 관련 라우트를 /api/likes 경로에 등록합니다.
app.use('/api/likes', likeRoutes);

// 팔로우 관련 라우트를 /api/users 경로에 등록합니다.
app.use('/api/users', followRoutes);

// 알림 관련 라우트를 /api/notifications 경로에 등록합니다.
app.use('/api/notifications', notificationRoutes);

// 이미지 프록시 라우트를 /api/images 경로에 등록합니다.
app.use('/api/images', imageRoutes);

// 오류 처리 미들웨어
app.use(errorHandler);

console.log('router ready');

// 설정 파일에서 포트 번호를 가져와 서버를 시작합니다.
app.listen(config.PORT, () => console.log(`PORT : ${config.PORT}`));
