import { getMessage } from '../utils/messageMapper';
import { PrismaClient } from '@prisma/client';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

interface CreateCommentData {
    userId: number;
    content: string;
    parentId?: number;
    photoId?: number;
    seriesId?: number;
}

export const createComment = async (data: CreateCommentData) => {
    const { userId, content, parentId, photoId, seriesId } = data;

    let targetOwnerId: number | undefined;

    if (photoId) {
        const photo = await prisma.photo.findUnique({ where: { id: photoId, deletedAt: null }, select: { userId: true } });
        if (!photo) throw new Error(getMessage('PHOTO_NOT_FOUND'));
        targetOwnerId = photo.userId;
    } else if (seriesId) {
        const series = await prisma.series.findUnique({ where: { id: seriesId }, select: { userId: true } });
        if (!series) throw new Error(getMessage('SERIES_NOT_FOUND'));
        targetOwnerId = series.userId;
    } else {
        throw new Error(getMessage('INVALID_COMMENT_TARGET'));
    }

    if (parentId) {
        const parentComment = await prisma.comment.findUnique({ where: { id: parentId, deletedAt: null } });
        if (!parentComment) throw new Error(getMessage('PARENT_COMMENT_NOT_FOUND'));
        if ((photoId && parentComment.photoId !== photoId) || (seriesId && parentComment.seriesId !== seriesId)) {
            throw new Error(getMessage('PARENT_COMMENT_DOES_NOT_BELONG_TO_THIS_RESOURCE'));
        }
    }

    const newComment = await prisma.comment.create({
        data: { userId, content, parentId, photoId, seriesId },
    });

    // Notify content owner
    if (targetOwnerId) {
        await notificationService.createNotification({
            userId: targetOwnerId,
            actorId: userId,
            eventType: 'NEW_COMMENT',
            commentId: newComment.id,
            photoId,
            seriesId,
        });
    }

    // Notify parent comment owner
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({ where: { id: parentId }, select: { userId: true } });
        if (parentComment && parentComment.userId !== targetOwnerId) {
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

export const getComments = async (target: { photoId?: number; seriesId?: number }) => {
    const { photoId, seriesId } = target;
    const whereClause = photoId ? { photoId, deletedAt: null } : { seriesId, deletedAt: null };

    const comments = await prisma.comment.findMany({
        where: whereClause,
        include: {
            author: { select: { id: true, username: true, profileImageUrl: true } },
            likes: { select: { userId: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const commentMap = new Map<number, any>();
    const rootComments: any[] = [];

    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
                parent.replies.push(commentMap.get(comment.id));
            }
        } else {
            rootComments.push(commentMap.get(comment.id));
        }
    });

    return rootComments;
};

export const deleteComment = async (commentId: number, userId: number) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw new Error(getMessage('COMMENT_NOT_FOUND'));
    }

    if (comment.userId !== userId) {
        throw new Error(getMessage('UNAUTHORIZED_COMMENT_DELETION'));
    }

    return prisma.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
    });
};