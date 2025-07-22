import { getMessage } from '../utils/messageMapper';
import { getPrismaClient } from './prismaClient';
import * as notificationService from './notification.service';

const prisma = getPrismaClient();

type LikeTarget =
    | { photoId: number; seriesId?: never; commentId?: never }
    | { photoId?: never; seriesId: number; commentId?: never }
    | { photoId?: never; seriesId?: never; commentId: number };

export const toggleLike = async (userId: number, target: LikeTarget) => {
    const { photoId, seriesId, commentId } = target;

    let likeWhere: any;
    let targetOwnerId: number;

    if (photoId) {
        const photo = await prisma.photo.findUnique({ where: { id: photoId } });
        if (!photo || photo.deletedAt) throw new Error(getMessage('PHOTO_NOT_FOUND'));
        if (!photo.isPublic && photo.userId !== userId) throw new Error(getMessage('PHOTO_IS_PRIVATE'));
        targetOwnerId = photo.userId;
        likeWhere = { userId_photoId: { userId, photoId } };
    } else if (seriesId) {
        const series = await prisma.series.findUnique({ where: { id: seriesId } });
        if (!series || series.deletedAt) throw new Error(getMessage('SERIES_NOT_FOUND'));
        if (!series.isPublic && series.userId !== userId) throw new Error(getMessage('SERIES_IS_PRIVATE'));
        targetOwnerId = series.userId;
        likeWhere = { userId_seriesId: { userId, seriesId } };
    } else if (commentId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { photo: true, series: true }
        });
        if (!comment || comment.deletedAt) throw new Error(getMessage('COMMENT_NOT_FOUND'));

        // Check access to parent resource
        if (comment.photo) {
            if (!comment.photo.isPublic && comment.photo.userId !== userId) throw new Error(getMessage('PHOTO_IS_PRIVATE'));
        } else if (comment.series) {
            if (!comment.series.isPublic && comment.series.userId !== userId) throw new Error(getMessage('SERIES_IS_PRIVATE'));
        }
        targetOwnerId = comment.userId;
        likeWhere = { userId_commentId: { userId, commentId } };
    } else {
        throw new Error('Invalid like target');
    }

    const existingLike = await prisma.like.findUnique({ where: likeWhere });

    if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
        const targetType = photoId ? 'Photo' : seriesId ? 'Series' : 'Comment';
        return { message: `${targetType} unliked`, liked: false };
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
        return { message: `${targetType} liked`, liked: true };
    }
};
