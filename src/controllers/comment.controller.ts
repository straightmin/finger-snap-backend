import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { photoId, seriesId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: getErrorMessage("COMMENT.CONTENT_EMPTY", lang) });
    }

    const newComment = await commentService.createComment({
        userId,
        content,
        parentId: parentId ? parseInt(parentId, 10) : undefined,
        photoId: photoId ? parseInt(photoId, 10) : undefined,
        seriesId: seriesId ? parseInt(seriesId, 10) : undefined,
    });

    res.status(201).json(newComment);
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const { photoId, seriesId } = req.params;
    // 유저가 로그인하지 않은 경우, 공개된 콘텐츠만 볼 수 있습니다. 로그인한 경우 자신의 비공개 콘텐츠도 볼 수 있습니다.
    const userId = req.user?.id; // Can be undefined if user is not logged in
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    let comments;
    if (photoId) {
        comments = await commentService.getComments(userId, { photoId: parseInt(photoId, 10) });
    } else if (seriesId) {
        comments = await commentService.getComments(userId, { seriesId: parseInt(seriesId, 10) });
    } else {
        return res.status(400).json({ message: getErrorMessage("COMMENT.TARGET_REQUIRED", lang) });
    }

    res.status(200).json(comments);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId, 10);
    const userId = req.user!.id;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    await commentService.deleteComment(commentId, userId);

    res.status(200).json({ message: getSuccessMessage("COMMENT.DELETED", lang) });
});
