// src/server.ts
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import photoRoutes from "./routes/photo.routes";
import likeRoutes from "./routes/like.routes";
import commentRoutes from "./routes/comment.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config(); // 환경 변수 로드

// 필수 환경 변수 확인
const requiredEnvVars = [
    "AWS_REGION",
    "AWS_S3_BUCKET_NAME",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "JWT_SECRET",
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable: ${envVar}`);
        process.exit(1); // 애플리케이션 종료
    }
}

// Express 애플리케이션을 생성합니다.
const app = express();

// JSON 요청 본문을 파싱하기 위한 미들웨어를 추가합니다.
app.use(express.json());

// 인증 관련 라우트를 /api/auth 경로에 등록합니다.
app.use("/api/auth", authRoutes);

// 사진 관련 라우트를 /api/photos 경로에 등록합니다.
app.use("/api/photos", photoRoutes);

// 댓글 관련 라우트를 /api/photos 경로에 등록합니다.
app.use("/api/photos", commentRoutes);

// 좋아요 관련 라우트를 /api/likes 경로에 등록합니다.
app.use("/api/likes", likeRoutes);

// 오류 처리 미들웨어
app.use(errorHandler);

console.log("router ready");

// 3000번 포트에서 서버를 시작합니다.
app.listen(3000, () => console.log("PORT : 3000"));
