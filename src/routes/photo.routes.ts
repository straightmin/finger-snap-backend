// src/routes/photo.routes.ts
import { Router } from 'express';
import { getPhotos, uploadPhoto } from '../controllers/photo.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

// Express 라우터 인스턴스를 생성합니다.
const router = Router();

// GET /api/photos
// 사진 목록을 조회하는 라우트입니다.
// 쿼리 파라미터 `sortBy` 값에 따라 '최신순' 또는 '인기순'으로 정렬됩니다.
router.get('/', getPhotos);

// POST /api/photos
// 사진을 업로드하는 라우트입니다.
// 인증된 사용자만 접근할 수 있으며, 'photo'라는 이름의 필드로 파일을 받습니다.
router.post('/', authenticateToken, upload.single('photo'), uploadPhoto);

// 설정된 라우터를 모듈 외부로 내보냅니다.
export default router;
