// src/server.ts
import express from "express";
import config from "./config"; // 중앙 설정 파일 임포트
import authRoutes from "./routes/auth.routes";
import photoRoutes from "./routes/photo.routes";
import likeRoutes from "./routes/like.routes";
import commentRoutes from "./routes/comment.routes";
import followRoutes from "./routes/follow.routes";
import collectionRoutes from "./routes/collection.routes"; // 새로 추가
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/user.routes";

// Express 애플리케이션을 생성합니다.
const app = express();

// JSON 요청 본문을 파싱하기 위한 미들웨어를 추가합니다.
app.use(express.json());

// 사용자 관련 라우트를 /api/users 경로에 등록합니다.
app.use("/api/users", userRoutes);

// 인증 관련 라우트를 /api/auth 경로에 등록합니다.
app.use("/api/auth", authRoutes);

// 댓글 관련 라우트를 /api/photos 경로에 등록합니다.
// photoRoutes보다 먼저 등록해야 라우팅 충돌을 방지할 수 있습니다.
app.use("/api/photos", commentRoutes);

// 사진 관련 라우트를 /api/photos 경로에 등록합니다.
app.use("/api/photos", photoRoutes);

// 컬렉션 관련 라우트를 /api/collections 경로에 등록합니다.
app.use("/api/collections", collectionRoutes);

// 좋아요 관련 라우트를 /api/likes 경로에 등록합니다.
app.use("/api/likes", likeRoutes);

// 팔로우 관련 라우트를 /api/users 경로에 등록합니다.
app.use("/api/users", followRoutes);

// 오류 처리 미들웨어
app.use(errorHandler);

console.log("router ready");

// 설정 파일에서 포트 번호를 가져와 서버를 시작합니다.
app.listen(config.PORT, () => console.log(`PORT : ${config.PORT}`));
