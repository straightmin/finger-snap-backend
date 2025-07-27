// src/routes/user.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getMyCollections, getUserCollections } from '../controllers/collection.controller';
import { validateSchema, commonSchemas } from '../utils/validation';
import {
    getMyProfile,
    updateMyProfile,
    getMyPhotos,
    getMyLikedPhotos,
    updateNotificationPreferences,
    deleteMyAccount
} from '../controllers/user.controller';

const router = Router();

router.get('/me/profile', authenticateToken, getMyProfile);
router.put('/me/profile', authenticateToken, validateSchema(commonSchemas.userProfileUpdate), updateMyProfile);
router.get('/me/photos', authenticateToken, getMyPhotos);
router.get('/me/likes', authenticateToken, getMyLikedPhotos);
router.put('/me/notifications', authenticateToken, validateSchema(commonSchemas.userProfileUpdate), updateNotificationPreferences);
router.delete('/me', authenticateToken, deleteMyAccount);

router.get('/me/collections', authenticateToken, getUserCollections);
router.get('/me/collections/default', authenticateToken, getMyCollections);

export default router;
