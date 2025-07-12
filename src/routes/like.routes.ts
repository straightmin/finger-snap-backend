import { Router } from 'express';
import { toggleLike } from '../controllers/like.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, toggleLike);

export default router;
