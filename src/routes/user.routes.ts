// src/routes/user.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    getMyProfile,
    updateMyProfile,
    getMyPhotos,
    getMyLikedPhotos
} from '../controllers/user.controller';

const router = Router();

router.get('/me/profile', authenticateToken, getMyProfile);
router.put('/me/profile', authenticateToken, updateMyProfile);
router.get('/me/photos', authenticateToken, getMyPhotos);
router.get('/me/likes', authenticateToken, getMyLikedPhotos);

export default router;
