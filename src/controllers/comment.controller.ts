import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/comment.service';

/**
 * 댓글을 작성하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.photoId`로 사진 ID, `req.body.content`로 댓글 내용, `req.body.parentId`로 부모 댓글 ID (선택), `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 생성된 댓글 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoId = parseInt(req.params.photoId, 10);
        const { content, parentId } = req.body;
        const userId = req.user!.id; // authenticateToken 미들웨어를 통해 req.user가 보장됨

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'COMMENT_CONTENT_CANNOT_BE_EMPTY' });
        }

        const newComment = await commentService.createComment({
            photoId,
            userId,
            content,
            parentId: parentId ? parseInt(parentId, 10) : undefined,
        });

        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    }
};
