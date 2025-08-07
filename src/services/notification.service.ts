import { getPrismaClient } from '../utils/prismaClient';

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

/**
 * 새로운 알림을 생성합니다.
 * @param data 알림 데이터
 * @returns 생성된 알림 객체 또는 undefined (중복/자기 알림/사용자 설정에 의해 차단된 경우)
 */
export const createNotification = async (data: NotificationData) => {
    if (data.userId === data.actorId) {
        return;
    }

    // 사용자의 알림 설정을 확인합니다.
    const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: {
            notifyLikes: true,
            notifyComments: true,
            notifyFollows: true,
            notifySeries: true,
        },
    });

    if (!user) {
        return;
    }

    // 이벤트 타입에 따라 사용자 설정을 확인합니다.
    switch (data.eventType) {
        case 'NEW_LIKE':
            if (!user.notifyLikes) return;
            break;
        case 'NEW_COMMENT':
            if (!user.notifyComments) return;
            break;
        case 'NEW_FOLLOW':
            if (!user.notifyFollows) return;
            break;
        case 'NEW_SERIES':
            if (!user.notifySeries) return;
            break;
        default:
            break;
    }

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

/**
 * 사용자의 알림 목록을 조회합니다.
 * @param userId 사용자 ID
 * @param page 페이지 번호
 * @param limit 페이지당 알림 수
 * @returns 알림 목록
 */
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

/**
 * 알림을 읽음 상태로 표시합니다.
 * @param userId 사용자 ID
 * @param notificationIds 읽음 표시할 알림 ID 배열
 * @returns 업데이트 결과
 */
export const markAsRead = async (userId: number, notificationIds: number[]) => {
    return prisma.notification.updateMany({
        where: {
            id: { in: notificationIds },
            userId: userId, // Ensure user can only mark their own notifications
        },
        data: { isRead: true },
    });
};
