// src/routes/collections.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';

import { createCollection, getUserCollections, getCollectionById, updateCollection, deleteCollection, addPhotoToCollection, removePhotoFromCollection } from '../controllers/collection.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Photo collection management
 */

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
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
 *         description: Collection created successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', authenticateToken, createCollection);

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get all collections for the current user
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of collections.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', authenticateToken, getUserCollections);

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Get a collection by ID
 *     tags: [Collections]
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
 *         description: Collection data.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Collection not found.
 */
router.get('/:id', authenticateToken, getCollectionById);

/**
 * @swagger
 * /collections/{id}:
 *   put:
 *     summary: Update a collection
 *     tags: [Collections]
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
 *         description: Collection updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Collection not found.
 */
router.put('/:id', authenticateToken, updateCollection);

/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection
 *     tags: [Collections]
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
 *         description: Collection deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Collection not found.
 */
router.delete('/:id', authenticateToken, deleteCollection);

/**
 * @swagger
 * /collections/{collectionId}/photos/{photoId}:
 *   post:
 *     summary: Add a photo to a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionId
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
 *         description: Photo added to collection successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Collection or photo not found.
 */
router.post('/:collectionId/photos/:photoId', authenticateToken, addPhotoToCollection);

/**
 * @swagger
 * /collections/{collectionId}/photos/{photoId}:
 *   delete:
 *     summary: Remove a photo from a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionId
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
 *         description: Photo removed from collection successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Collection or photo not found.
 */
router.delete('/:collectionId/photos/:photoId', authenticateToken, removePhotoFromCollection);

export default router;