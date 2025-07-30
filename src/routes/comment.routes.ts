// src/routes/comment.routes.ts
import { Router } from 'express';
import { createComment, getComments, deleteComment } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management for photos and series
 */

/**
 * @swagger
 * /photos/{photoId}/comments:
 *   post:
 *     summary: Create a new comment on a photo
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Photo not found.
 */
router.post('/photos/:photoId/comments', authenticateToken, createComment);

/**
 * @swagger
 * /photos/{photoId}/comments:
 *   get:
 *     summary: Get all comments for a photo
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of comments.
 *       404:
 *         description: Photo not found.
 */
router.get('/photos/:photoId/comments', getComments);

/**
 * @swagger
 * /series/{seriesId}/comments:
 *   post:
 *     summary: Create a new comment on a series
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series not found.
 */
router.post('/series/:seriesId/comments', authenticateToken, createComment);

/**
 * @swagger
 * /series/{seriesId}/comments:
 *   get:
 *     summary: Get all comments for a series
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of comments.
 *       404:
 *         description: Series not found.
 */
router.get('/series/:seriesId/comments', getComments);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Comment not found.
 */
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;