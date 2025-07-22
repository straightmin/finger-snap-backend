import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { photoId, seriesId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'COMMENT_CONTENT_CANNOT_BE_EMPTY' });
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

    let comments;
    if (photoId) {
        comments = await commentService.getComments(userId, { photoId: parseInt(photoId, 10) });
    } else if (seriesId) {
        comments = await commentService.getComments(userId, { seriesId: parseInt(seriesId, 10) });
    } else {
        return res.status(400).json({ message: 'Either photoId or seriesId must be provided' });
    }

    res.status(200).json(comments);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId, 10);
    const userId = req.user!.id;

    await commentService.deleteComment(commentId, userId);

    res.status(200).json({ message: 'COMMENT_DELETED_SUCCESSFULLY' });
});
