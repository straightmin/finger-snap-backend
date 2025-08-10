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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and data management (for the authenticated user)
 */

/**
 * @swagger
 * /users/me/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me/profile', authenticateToken, getMyProfile);

/**
 * @swagger
 * /users/me/profile:
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.put('/me/profile', authenticateToken, validateSchema(commonSchemas.userProfileUpdate), updateMyProfile);

/**
 * @swagger
 * /users/me/photos:
 *   get:
 *     summary: Get my photos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of my photos.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me/photos', authenticateToken, getMyPhotos);

/**
 * @swagger
 * /users/me/likes:
 *   get:
 *     summary: Get my liked photos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of my liked photos.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me/likes', authenticateToken, getMyLikedPhotos);

/**
 * @swagger
 * /users/me/notifications:
 *   put:
 *     summary: Update my notification preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               onComment:
 *                 type: boolean
 *               onLike:
 *                 type: boolean
 *               onFollow:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.put('/me/notifications', authenticateToken, validateSchema(commonSchemas.notificationSettings), updateNotificationPreferences);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete my account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete('/me', authenticateToken, deleteMyAccount);

/**
 * @swagger
 * /users/me/collections:
 *   get:
 *     summary: Get my collections
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of my collections.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me/collections', authenticateToken, getUserCollections);

/**
 * @swagger
 * /users/me/collections/default:
 *   get:
 *     summary: Get my default collection
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My default collection.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me/collections/default', authenticateToken, getMyCollections);

export default router;