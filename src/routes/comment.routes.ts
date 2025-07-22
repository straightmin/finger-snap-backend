import { Router } from 'express';
import { createComment, getComments, deleteComment } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Photos
router.post('/photos/:photoId/comments', authenticateToken, createComment);
router.get('/photos/:photoId/comments', getComments);

// Series
router.post('/series/:seriesId/comments', authenticateToken, createComment);
router.get('/series/:seriesId/comments', getComments);

// General
router.delete('/:commentId', authenticateToken, deleteComment);

export default router;
