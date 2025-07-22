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
    // 자기 자신에게는 알림을 생성하지 않음
    if (data.userId === data.actorId) {
        return;
    }

    return prisma.notification.create({
        data,
    });
};
