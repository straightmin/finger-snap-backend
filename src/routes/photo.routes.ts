// src/routes/photo.routes.ts
import { Router } from 'express';
import { getPhotos } from '../controllers/photo.controller';

// Express 라우터 인스턴스를 생성합니다.
const router = Router();

// GET /api/photos
// 사진 목록을 조회하는 라우트입니다.
// 쿼리 파라미터 `sortBy` 값에 따라 '최신순' 또는 '인기순'으로 정렬됩니다.
router.get('/', getPhotos);

// 설정된 라우터를 모듈 외부로 내보냅니다.
export default router;
