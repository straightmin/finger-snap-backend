// src/routes/photo.routes.ts
import { Router } from 'express';
import { toggleCollection } from '../controllers/collection.controller';
import {
    getPhotos,
    uploadPhoto,
    deletePhoto,
    getPhotoById,
    updatePhotoVisibility,
    getLikedPhotos,
} from '../controllers/photo.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

// Express 라우터 인스턴스를 생성합니다.
const router = Router();

// GET /api/photos
// 사진 목록을 조회하는 라우트입니다.
// 쿼리 파라미터 `sortBy` 값에 따라 '최신순' 또는 '인기순'으로 정렬됩니다.
router.get('/', getPhotos);

// GET /api/photos/liked
// 사용자가 좋아요를 누른 사진 목록을 조회하는 라우트입니다.
router.get('/liked', authenticateToken, getLikedPhotos);

// GET /api/photos/:id
// 특정 ID의 사진을 조회하는 라우트입니다.
router.get('/:id', getPhotoById);

// POST /api/photos
// 사진을 업로드하는 라우트입니다.
// 인증된 사용자만 접근할 수 있으며, 'photo'라는 이름의 필드로 파일을 받습니다.
router.post('/', authenticateToken, upload.single('photo'), uploadPhoto);

// PATCH /api/photos/:id/visibility
// 특정 ID의 사진 공개 상태를 변경하는 라우트입니다.
// 인증된 사용자만 자신의 사진 상태를 변경할 수 있습니다.
router.patch('/:id/visibility', authenticateToken, updatePhotoVisibility);

// DELETE /api/photos/:id
// 특정 ID의 사진을 삭제하는 라우트입니다.
// 인증된 사용자만 자신의 사진을 삭제할 수 있습니다.
router.delete('/:id', authenticateToken, deletePhoto);

// POST /api/photos/:photoId/toggle-collection
// 특정 사진을 '기본 컬렉션'에 추가/제거하는 라우트입니다.
router.post('/:photoId/toggle-collection', authenticateToken, toggleCollection);

// 설정된 라우터를 모듈 외부로 내보냅니다.
export default router;
