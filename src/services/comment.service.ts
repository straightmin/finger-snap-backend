import { getErrorMessage, Language } from '../utils/messageMapper';
import { PrismaClient, Comment } from '@prisma/client';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

/**
 * 리소스(사진 또는 시리즈)에 대한 접근 권한을 확인합니다.
 * @param userId 사용자 ID
 * @param photoId 사진 ID (선택 사항)
 * @param seriesId 시리즈 ID (선택 사항)
 * @param lang 언어 설정
 * @returns 리소스 소유자 정보
 */
const checkAccess = async (userId: number | undefined, photoId?: number, seriesId?: number, lang?: Language) => {
    if (photoId) {
        const photo = await prisma.photo.findUnique({ where: { id: photoId } });
        if (!photo || photo.deletedAt) throw new Error(getErrorMessage("PHOTO.NOT_FOUND", lang));
        if (!photo.isPublic && photo.userId !== userId) throw new Error(getErrorMessage('PHOTO.IS_PRIVATE', lang));
        return { ownerId: photo.userId };
    } else if (seriesId) {
        const series = await prisma.series.findUnique({ where: { id: seriesId } });
        if (!series || series.deletedAt) throw new Error(getErrorMessage('SERIES.NOT_FOUND', lang));
        if (!series.isPublic && series.userId !== userId) throw new Error(getErrorMessage('SERIES.IS_PRIVATE', lang));
        return { ownerId: series.userId };
    } else {
        throw new Error(getErrorMessage('COMMENT.TARGET_REQUIRED', lang));
    }
};

interface CreateCommentData {
    userId: number;
    content: string;
    parentId?: number;
    photoId?: number;
    seriesId?: number;
}

/**
 * 새로운 댓글을 생성합니다.
 * @param data 댓글 생성 데이터
 * @param lang 언어 설정
 * @returns 생성된 댓글 객체
 */
export const createComment = async (data: CreateCommentData, lang: Language) => {
    const { userId, content, parentId, photoId, seriesId } = data;

    const { ownerId } = await checkAccess(userId, photoId, seriesId, lang);

    if (parentId) {
        const parentComment = await prisma.comment.findUnique({ where: { id: parentId, deletedAt: null } });
        if (!parentComment) throw new Error(getErrorMessage('COMMENT.PARENT_NOT_FOUND', lang));
        if ((photoId && parentComment.photoId !== photoId) || (seriesId && parentComment.seriesId !== seriesId)) {
            throw new Error(getErrorMessage('COMMENT.PARENT_NOT_BELONG_TO_RESOURCE', lang));
        }
    }

    const newComment = await prisma.comment.create({
        data: { userId, content, parentId, photoId, seriesId },
    });

    // Notify content owner
    await notificationService.createNotification({
        userId: ownerId,
        actorId: userId,
        eventType: 'NEW_COMMENT',
        commentId: newComment.id,
        photoId,
        seriesId,
    });

    // Notify parent comment owner
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({ where: { id: parentId }, select: { userId: true } });
        if (parentComment && parentComment.userId !== userId && parentComment.userId !== ownerId) {
            await notificationService.createNotification({
                userId: parentComment.userId,
                actorId: userId,
                eventType: 'NEW_REPLY',
                commentId: newComment.id,
                photoId,
                seriesId,
            });
        }
    }

    return newComment;
};

/**
 * 사진 또는 시리즈의 댓글 목록을 조회합니다.
 * @param userId 사용자 ID
 * @param target 대상 리소스 (photoId 또는 seriesId)
 * @param lang 언어 설정
 * @returns 중첩된 댓글 목록
 */
export const getComments = async (userId: number | undefined, target: { photoId?: number; seriesId?: number }, lang?: Language) => {
    const { photoId, seriesId } = target;
    // If user is not logged in, they can only see public content. If logged in, they can see their own private content.
    // 유저가 로그인하지 않은 경우, 공개된 콘텐츠만 볼 수 있습니다. 로그인한 경우 자신의 비공개 콘텐츠도 볼 수 있습니다.
    await checkAccess(userId, photoId, seriesId, lang);

    const whereClause = photoId ? { photoId, deletedAt: null } : { seriesId, deletedAt: null };

    const comments = await prisma.comment.findMany({
        where: whereClause,
        include: {
            author: { select: { id: true, username: true, profileImageUrl: true } },
            likes: { select: { userId: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    interface NestedComment extends Comment {
        replies: NestedComment[];
    }

    const commentMap = new Map<number, NestedComment>();
    const rootComments: NestedComment[] = [];

    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
                parent.replies.push(commentMap.get(comment.id)!);
            }
        } else {
            rootComments.push(commentMap.get(comment.id)!);
        }
    });

    return rootComments;
};

/**
 * 댓글을 삭제합니다.
 * @param commentId 댓글 ID
 * @param userId 사용자 ID
 * @param lang 언어 설정
 * @returns 삭제된 댓글 객체
 */
export const deleteComment = async (commentId: number, userId: number, lang: Language) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw new Error(getErrorMessage('COMMENT.NOT_FOUND', lang));
    }

    if (comment.userId !== userId) {
        throw new Error(getErrorMessage('COMMENT.UNAUTHORIZED_DELETE', lang));
    }

    return prisma.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
    });
};