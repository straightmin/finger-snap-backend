// src/routes/series.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    createSeries,
    getSeriesById,
    getMySeries,
    updateSeries,
    deleteSeries,
    addPhotoToSeries,
    removePhotoFromSeries,
    updateSeriesPhotoOrder,
} from '../controllers/series.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Series
 *   description: Photo series management
 */

/**
 * @swagger
 * /series:
 *   post:
 *     summary: Create a new series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Series created successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', authenticateToken, createSeries);

/**
 * @swagger
 * /series/me:
 *   get:
 *     summary: Get all series for the current user
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of series.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', authenticateToken, getMySeries);

/**
 * @swagger
 * /series/{id}:
 *   get:
 *     summary: Get a series by ID
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Series data.
 *       404:
 *         description: Series not found.
 */
router.get('/:id', getSeriesById);

/**
 * @swagger
 * /series/{id}:
 *   put:
 *     summary: Update a series
 *     tags: [Series]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Series updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series not found.
 */
router.put('/:id', authenticateToken, updateSeries);

/**
 * @swagger
 * /series/{id}:
 *   delete:
 *     summary: Delete a series
 *     tags: [Series]
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
 *         description: Series deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series not found.
 */
router.delete('/:id', authenticateToken, deleteSeries);

/**
 * @swagger
 * /series/{seriesId}/photos/{photoId}:
 *   post:
 *     summary: Add a photo to a series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo added to series successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series or photo not found.
 */
router.post('/:seriesId/photos/:photoId', authenticateToken, addPhotoToSeries);

/**
 * @swagger
 * /series/{seriesId}/photos/{photoId}:
 *   delete:
 *     summary: Remove a photo from a series
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo removed from series successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series or photo not found.
 */
router.delete('/:seriesId/photos/:photoId', authenticateToken, removePhotoFromSeries);

/**
 * @swagger
 * /series/{seriesId}/photos/order:
 *   put:
 *     summary: Update the order of photos in a series
 *     tags: [Series]
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
 *               photoIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Photo order updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Series not found.
 */
router.put('/:seriesId/photos/order', authenticateToken, updateSeriesPhotoOrder);

export default router;