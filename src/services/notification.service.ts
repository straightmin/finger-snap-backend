import { getPrismaClient } from './prismaClient';

const prisma = getPrismaClient();

interface NotificationData {
    userId: number;
    actorId: number;
    eventType: string;
    photoId?: number;
    seriesId?: number;
    commentId?: number;
    likeId?: number;
    followId?: number;
}

export const createNotification = async (data: NotificationData) => {
    if (data.userId === data.actorId) {
        return;
    }

    // Avoid duplicate notifications for the same action
    // 같은 액션에 대해 중복 알림을 방지합니다.
    const existingNotification = await prisma.notification.findFirst({
        where: {
            userId: data.userId,
            actorId: data.actorId,
            eventType: data.eventType,
            photoId: data.photoId,
            seriesId: data.seriesId,
            commentId: data.commentId,
            likeId: data.likeId,
            followId: data.followId,
        }
    });

    if (existingNotification) {
        return;
    }

    return prisma.notification.create({
        data,
    });
};

export const getNotifications = async (userId: number, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    return prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: { select: { id: true, username: true, profileImageUrl: true } },
            photo: { select: { id: true, title: true, thumbnailUrl: true } },
            series: { select: { id: true, title: true } },
        }
    });
};

export const markAsRead = async (userId: number, notificationIds: number[]) => {
    return prisma.notification.updateMany({
        where: {
            id: { in: notificationIds },
            userId: userId, // Ensure user can only mark their own notifications
        },
        data: { isRead: true },
    });
};
