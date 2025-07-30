// src/routes/follow.routes.ts
import { Router } from 'express';
import {
    toggleFollow,
    getFollowers,
    getFollowing,
} from '../controllers/follow.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Follows
 *   description: User following and follower management
 */

/**
 * @swagger
 * /users/{id}/toggle-follow:
 *   post:
 *     summary: Follow or unfollow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to follow or unfollow.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully followed or unfollowed the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *                   description: True if the current user is now following the target user, false otherwise.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.post('/:id/toggle-follow', authenticateToken, toggleFollow);

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     summary: Get a list of a user's followers
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of followers.
 *       404:
 *         description: User not found.
 */
router.get('/:id/followers', getFollowers);

/**
 * @swagger
 * /users/{id}/following:
 *   get:
 *     summary: Get a list of users a user is following
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of users being followed.
 *       404:
 *         description: User not found.
 */
router.get('/:id/following', getFollowing);

export default router;