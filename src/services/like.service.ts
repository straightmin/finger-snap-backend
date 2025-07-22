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

    let targetWhere: any;
    let likeWhere: any;
    let targetType: 'photo' | 'series' | 'comment';

    if (photoId) {
        targetType = 'photo';
        targetWhere = { id: photoId };
        likeWhere = { userId_photoId: { userId, photoId } };
    } else if (seriesId) {
        targetType = 'series';
        targetWhere = { id: seriesId };
        likeWhere = { userId_seriesId: { userId, seriesId } };
    } else if (commentId) {
        targetType = 'comment';
        targetWhere = { id: commentId };
        likeWhere = { userId_commentId: { userId, commentId } };
    } else {
        throw new Error('Invalid like target');
    }

    let existingTarget;
    switch (targetType) {
        case 'photo':
            existingTarget = await prisma.photo.findUnique({
                where: targetWhere,
                select: { userId: true, deletedAt: true, isPublic: true },
            });
            break;
        case 'series':
            existingTarget = await prisma.series.findUnique({
                where: targetWhere,
                select: { userId: true, deletedAt: true, isPublic: true },
            });
            break;
        case 'comment':
            existingTarget = await prisma.comment.findUnique({
                where: targetWhere,
                select: { userId: true, deletedAt: true, isPublic: true },
            });
            break;
        default:
            throw new Error('Invalid target type');
    }

    if (!existingTarget) {
        throw new Error(getMessage(`${targetType.toUpperCase()}_NOT_FOUND`));
    }

    if (existingTarget.deletedAt) {
        throw new Error(getMessage(`${targetType.toUpperCase()}_IS_DELETED`));
    }

    if (targetType === 'photo' && !existingTarget.isPublic && existingTarget.userId !== userId) {
        throw new Error(getMessage('PHOTO_IS_PRIVATE'));
    }

    if (targetType === 'series' && !existingTarget.isPublic && existingTarget.userId !== userId) {
        throw new Error(getMessage('SERIES_IS_PRIVATE'));
    }

    const existingLike = await prisma.like.findUnique({
        where: likeWhere,
    });

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id },
        });
        return { message: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} unliked`, liked: false };
    } else {
        const newLike = await prisma.like.create({
            data: {
                userId,
                ...target,
            },
        });

        await notificationService.createNotification({
            userId: existingTarget.userId,
            actorId: userId,
            eventType: 'NEW_LIKE',
            likeId: newLike.id,
            ...target,
        });

        return { message: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} liked`, liked: true };
    }
};
