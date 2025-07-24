import { getMessage, getErrorMessage, Language } from '../utils/messageMapper';
import { getPrismaClient } from './prismaClient';
import * as notificationService from './notification.service';

const prisma = getPrismaClient();

export type LikeTarget =
    | { photoId: number; seriesId?: never; commentId?: never }
    | { photoId?: never; seriesId: number; commentId?: never }
    | { photoId?: never; seriesId?: never; commentId: number };

type LikeWhereClause = { userId_photoId: { userId: number; photoId: number; } } | { userId_seriesId: { userId: number; seriesId: number; } } | { userId_commentId: { userId: number; commentId: number; } };

export const toggleLike = async (userId: number, target: LikeTarget, lang: Language) => {
    const { photoId, seriesId, commentId } = target;

    let likeWhere: LikeWhereClause;
    let targetOwnerId: number;

    if (photoId) {
        const photo = await prisma.photo.findUnique({ where: { id: photoId } });
        if (!photo || photo.deletedAt) throw new Error(getErrorMessage('PHOTO.NOT_FOUND', lang));
        if (!photo.isPublic && photo.userId !== userId) throw new Error(getErrorMessage('PHOTO.IS_PRIVATE', lang));
        targetOwnerId = photo.userId;
        likeWhere = { userId_photoId: { userId, photoId } };
    } else if (seriesId) {
        const series = await prisma.series.findUnique({ where: { id: seriesId } });
        if (!series || series.deletedAt) throw new Error(getErrorMessage('SERIES.NOT_FOUND', lang));
        if (!series.isPublic && series.userId !== userId) throw new Error(getErrorMessage('SERIES.IS_PRIVATE', lang));
        targetOwnerId = series.userId;
        likeWhere = { userId_seriesId: { userId, seriesId } };
    } else if (commentId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { photo: true, series: true }
        });
        if (!comment || comment.deletedAt) throw new Error(getErrorMessage('COMMENT.NOT_FOUND', lang));

        // Check access to parent resource
        if (comment.photo) {
            if (!comment.photo.isPublic && comment.photo.userId !== userId) throw new Error(getErrorMessage('PHOTO.IS_PRIVATE', lang));
        } else if (comment.series) {
            if (!comment.series.isPublic && comment.series.userId !== userId) throw new Error(getErrorMessage('SERIES.IS_PRIVATE', lang));
        }
        targetOwnerId = comment.userId;
        likeWhere = { userId_commentId: { userId, commentId } };
    } else {
        throw new Error(getErrorMessage('LIKE.INVALID_TARGET', lang));
    }

    const existingLike = await prisma.like.findUnique({ where: likeWhere });

    if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
        const targetType = photoId ? 'Photo' : seriesId ? 'Series' : 'Comment';
        return { message: getMessage('INFO.LIKE.TARGET_UNLIKED', lang, { targetType }), liked: false };
    } else {
        const newLike = await prisma.like.create({
            data: { userId, ...target },
        });

        await notificationService.createNotification({
            userId: targetOwnerId,
            actorId: userId,
            eventType: 'NEW_LIKE',
            likeId: newLike.id,
            ...target,
        });

        const targetType = photoId ? 'Photo' : seriesId ? 'Series' : 'Comment';
        return { message: getMessage('INFO.LIKE.TARGET_LIKED', lang, { targetType }), liked: true };
    }
};
