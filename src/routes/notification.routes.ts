// src/routes/notification.routes.ts
import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of notifications.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', authenticateToken, getNotifications);

/**
 * @swagger
 * /notifications/read:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully marked all notifications as read.
 *       401:
 *         description: Unauthorized.
 */
router.patch('/read', authenticateToken, markAsRead);

export default router;