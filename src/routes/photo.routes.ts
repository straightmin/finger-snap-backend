// src/routes/photo.routes.ts
import { Router } from 'express';
import { toggleCollection } from '../controllers/collection.controller';
import {
    getPhotos,
    uploadPhoto,
    deletePhoto,
    getPhotoById,
    updatePhotoVisibility,
    getLikedPhotos,
} from '../controllers/photo.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Photos
 *   description: Photo management and retrieval
 */

/**
 * @swagger
 * /photos:
 *   get:
 *     summary: Get a list of photos
 *     tags: [Photos]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular]
 *         description: The sort order for the photos.
 *     responses:
 *       200:
 *         description: A list of photos.
 */
router.get('/', getPhotos);

/**
 * @swagger
 * /photos/liked:
 *   get:
 *     summary: Get photos liked by the current user
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of liked photos.
 *       401:
 *         description: Unauthorized.
 */
router.get('/liked', authenticateToken, getLikedPhotos);

/**
 * @swagger
 * /photos/{id}:
 *   get:
 *     summary: Get a photo by ID
 *     tags: [Photos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo data.
 *       404:
 *         description: Photo not found.
 */
router.get('/:id', getPhotoById);

/**
 * @swagger
 * /photos:
 *   post:
 *     summary: Upload a new photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Photo uploaded successfully.
 *       400:
 *         description: No file uploaded.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', authenticateToken, upload.single('photo'), uploadPhoto);

/**
 * @swagger
 * /photos/{id}/visibility:
 *   patch:
 *     summary: Update photo visibility
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Photo visibility updated.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Photo not found.
 */
router.patch('/:id/visibility', authenticateToken, updatePhotoVisibility);

/**
 * @swagger
 * /photos/{id}:
 *   delete:
 *     summary: Delete a photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Photo not found.
 */
router.delete('/:id', authenticateToken, deletePhoto);

/**
 * @swagger
 * /photos/{photoId}/toggle-collection:
 *   post:
 *     summary: Add or remove a photo from the default collection
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Toggled photo in collection successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Photo not found.
 */
router.post('/:photoId/toggle-collection', authenticateToken, toggleCollection);

export default router;