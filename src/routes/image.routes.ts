import { Router } from 'express';
import { getPhotoImage, getThumbnailImage } from '../controllers/image.controller';

const router = Router();

/**
 * @swagger
 * /images/{photoId}:
 *   get:
 *     summary: Get photo image by ID
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Image data
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid photo ID
 *       404:
 *         description: Image not found
 *       500:
 *         description: Server error
 */
router.get('/:photoId', getPhotoImage);

/**
 * @swagger
 * /images/thumbnails/{photoId}:
 *   get:
 *     summary: Get thumbnail image by ID
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Thumbnail image data
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid photo ID
 *       404:
 *         description: Thumbnail not found
 *       500:
 *         description: Server error
 */
router.get('/thumbnails/:photoId', getThumbnailImage);

export default router;