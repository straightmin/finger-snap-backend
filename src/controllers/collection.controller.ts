import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as collectionService from '../services/collection.service';

/**
 * 사진을 기본 컬렉션에 추가하거나 제거하는 컨트롤러 함수
 * POST /api/photos/:id/collection
 */
export const toggleCollection = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    if (isNaN(photoId)) {
        res.status(400).json({ message: 'Invalid photo ID' });
        return;
    }

    const result = await collectionService.togglePhotoInDefaultCollection(userId, photoId);
    res.status(200).json(result);
});

/**
 * 사용자의 기본 컬렉션에 있는 사진 목록을 조회하는 컨트롤러 함수
 * GET /api/users/me/collections
 */
export const getMyCollections = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const photos = await collectionService.getDefaultCollectionPhotos(userId);

    const photosWithLikeCount = photos.map(item => ({
        ...item.photo,
        likesCount: item.photo._count.likes,
    }));

    res.status(200).json(photosWithLikeCount);
});