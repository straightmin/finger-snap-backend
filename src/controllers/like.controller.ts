import { Request, Response } from 'express';
import * as likeService from '../services/like.service';
import { LikeTarget } from '../services/like.service';
import { getErrorMessage } from '../utils/messageMapper';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * 사진, 시리즈, 또는 댓글에 대한 좋아요를 토글합니다.
 * @param req HTTP 요청 객체 (photoId, seriesId, commentId 중 하나 포함)
 * @param res HTTP 응답 객체
 * @returns 좋아요 토글 결과
 */
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { photoId, seriesId, commentId } = req.body;

    if (!userId) {
        return res.status(401).json({ message: getErrorMessage('GLOBAL.UNAUTHORIZED', req.lang) });
    }

    const targetIds = [photoId, seriesId, commentId].filter(Boolean);
    if (targetIds.length !== 1) {
        return res.status(400).json({ message: getErrorMessage('LIKE.TARGET_REQUIRED', req.lang) });
    }

    let target: LikeTarget | undefined;
    if (photoId) {
        target = { photoId: Number(photoId) };
    } else if (seriesId) {
        target = { seriesId: Number(seriesId) };
    } else if (commentId) {
        target = { commentId: Number(commentId) };
    }

    const result = await likeService.toggleLike(userId, target!, req.lang || 'ko');

    res.status(200).json(result);
});
