// src/routes/like.routes.ts
import { Router } from 'express';
import { toggleLike } from '../controllers/like.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like management for photos, series, and comments
 */

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Toggle a like on a photo, series, or comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photoId:
 *                 type: integer
 *                 description: The ID of the photo to like/unlike. (Provide one of photoId, seriesId, or commentId)
 *               seriesId:
 *                 type: integer
 *                 description: The ID of the series to like/unlike. (Provide one of photoId, seriesId, or commentId)
 *               commentId:
 *                 type: integer
 *                 description: The ID of the comment to like/unlike. (Provide one of photoId, seriesId, or commentId)
 *     responses:
 *       200:
 *         description: Successfully liked or unliked the item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: True if the item is now liked by the user, false otherwise.
 *       400:
 *         description: Invalid request. You must provide exactly one of photoId, seriesId, or commentId.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: The specified item (photo, series, or comment) was not found.
 */
router.post('/', authenticateToken, toggleLike);

export default router;