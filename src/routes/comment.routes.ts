import { Router } from 'express';
import { createComment } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/photos/:photoId/comments
// 사진에 댓글을 작성하는 라우트 (인증 필요)
router.post('/:photoId/comments', authenticateToken, createComment);

export default router;
