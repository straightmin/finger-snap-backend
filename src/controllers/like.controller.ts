import { Request, Response } from 'express';
import * as likeService from '../services/like.service';
import { asyncHandler } from '../utils/asyncHandler';

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { photoId, seriesId, commentId } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const targetIds = [photoId, seriesId, commentId].filter(Boolean);
    if (targetIds.length !== 1) {
        return res.status(400).json({ message: 'Exactly one of photoId, seriesId, or commentId must be provided' });
    }

    let target: any;
    if (photoId) {
        target = { photoId: Number(photoId) };
    } else if (seriesId) {
        target = { seriesId: Number(seriesId) };
    } else if (commentId) {
        target = { commentId: Number(commentId) };
    }

    const result = await likeService.toggleLike(userId, target);

    res.status(200).json(result);
});
