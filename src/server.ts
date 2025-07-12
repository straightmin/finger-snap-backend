// src/server.ts
import express from "express";
import authRoutes from "./routes/auth.routes";
import photoRoutes from "./routes/photo.routes";
import commentRoutes from "./routes/comment.routes";

// Express 애플리케이션을 생성합니다.
const app = express();

// JSON 요청 본문을 파싱하기 위한 미들웨어를 추가합니다.
app.use(express.json());

// 인증 관련 라우트를 /api/auth 경로에 등록합니다.
app.use("/api/auth", authRoutes);

// 사진 관련 라우트를 /api/photos 경로에 등록합니다.
app.use("/api/photos", photoRoutes);

// 댓글 관련 라우트를 /api/photos/:photoId/comments 경로에 등록합니다.
app.use("/api/photos", commentRoutes);

console.log("router ready");

// 3000번 포트에서 서버를 시작합니다.
app.listen(3000, () => console.log("PORT : 3000"));
