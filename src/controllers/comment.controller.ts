import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

/**
 * 새로운 댓글을 생성합니다.
 * @param req HTTP 요청 객체 (content, parentId, photoId, seriesId 포함)
 * @param res HTTP 응답 객체
 * @returns 생성된 댓글 객체
 */
export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { photoId, seriesId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: getErrorMessage("COMMENT.CONTENT_EMPTY", req.lang) });
    }

    const newComment = await commentService.createComment({
        userId,
        content,
        parentId: parentId ? parseInt(parentId, 10) : undefined,
        photoId: photoId ? parseInt(photoId, 10) : undefined,
        seriesId: seriesId ? parseInt(seriesId, 10) : undefined,
    }, req.lang || 'ko');

    res.status(201).json(newComment);
});

/**
 * 사진 또는 시리즈의 댓글 목록을 조회합니다.
 * @param req HTTP 요청 객체 (photoId 또는 seriesId 포함)
 * @param res HTTP 응답 객체
 * @returns 댓글 목록
 */
export const getComments = asyncHandler(async (req: Request, res: Response) => {
    const { photoId, seriesId } = req.params;
    // 유저가 로그인하지 않은 경우, 공개된 콘텐츠만 볼 수 있습니다. 로그인한 경우 자신의 비공개 콘텐츠도 볼 수 있습니다.
    const userId = req.user?.id; // Can be undefined if user is not logged in

    let comments;
    if (photoId) {
        comments = await commentService.getComments(userId, { photoId: parseInt(photoId, 10) }, req.lang || 'ko');
    } else if (seriesId) {
        comments = await commentService.getComments(userId, { seriesId: parseInt(seriesId, 10) }, req.lang || 'ko');
    } else {
        return res.status(400).json({ message: getErrorMessage("COMMENT.TARGET_REQUIRED", req.lang) });
    }

    res.status(200).json(comments);
});

/**
 * 댓글을 삭제합니다.
 * @param req HTTP 요청 객체 (댓글 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 댓글 삭제 성공 메시지
 */
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.commentId, 10);
    const userId = req.user!.id;

    await commentService.deleteComment(commentId, userId, req.lang || 'ko');

    res.status(200).json({ message: getSuccessMessage("COMMENT.DELETED", req.lang) });
});
