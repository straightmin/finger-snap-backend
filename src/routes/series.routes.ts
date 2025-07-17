import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    createSeries,
    getSeriesById,
    getMySeries,
    updateSeries,
    deleteSeries,
    addPhotoToSeries,
    removePhotoFromSeries,
    updateSeriesPhotoOrder,
} from '../controllers/series.controller';

const router = Router();

// 새 시리즈 생성 (POST /api/series)
router.post('/', authenticateToken, createSeries);

// 현재 로그인된 사용자의 모든 시리즈 목록 조회 (GET /api/series/me)
router.get('/me', authenticateToken, getMySeries);

// 특정 시리즈 상세 조회 (GET /api/series/:id)
router.get('/:id', getSeriesById);

// 시리즈 정보 수정 (PUT /api/series/:id)
router.put('/:id', authenticateToken, updateSeries);

// 시리즈 삭제 (DELETE /api/series/:id)
router.delete('/:id', authenticateToken, deleteSeries);

// 시리즈에 사진 추가 (POST /api/series/:seriesId/photos/:photoId)
router.post('/:seriesId/photos/:photoId', authenticateToken, addPhotoToSeries);

// 시리즈에서 사진 제거 (DELETE /api/series/:seriesId/photos/:photoId)
router.delete('/:seriesId/photos/:photoId', authenticateToken, removePhotoFromSeries);

// 시리즈 내 사진 순서 업데이트 (PUT /api/series/:seriesId/photos/order)
router.put('/:seriesId/photos/order', authenticateToken, updateSeriesPhotoOrder);

export default router;
