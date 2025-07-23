import { Request, Response } from 'express';
import * as likeService from '../services/like.service';
import { getErrorMessage } from "../utils/messageMapper";
import { asyncHandler } from '../utils/asyncHandler';

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { photoId, seriesId, commentId } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (!userId) {
        return res.status(401).json({ message: getErrorMessage("GLOBAL.UNAUTHORIZED", lang) });
    }

    const targetIds = [photoId, seriesId, commentId].filter(Boolean);
    if (targetIds.length !== 1) {
        return res.status(400).json({ message: getErrorMessage("LIKE.TARGET_REQUIRED", lang) });
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
