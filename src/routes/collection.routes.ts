import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { toggleCollection, getMyCollections } from '../controllers/collection.controller';

const router = Router();

// 사진을 기본 컬렉션에 추가/제거 (POST /api/photos/:id/collection)
router.post('/:id/collection', authenticateToken, toggleCollection);

export default router;