// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';
import { isFollowing } from './follow.service';
import { getErrorMessage, Language } from "../utils/messageMapper";

const prisma = new PrismaClient();

type UserProfileWithFollowStatus = {
    id: number;
    username: string;
    email: string;
    bio: string | null;
    profileImageUrl: string | null;
    isFollowed: boolean;
    notifyLikes?: boolean;
    notifyComments?: boolean;
    notifyFollows?: boolean;
    notifySeries?: boolean;
};

/**
 * 사용자 프로필 정보를 조회합니다.
 * @param userId 조회할 사용자 ID
 * @param currentUserId 현재 로그인된 사용자 ID
 * @param lang 언어 설정
 * @returns 팔로우 상태가 포함된 사용자 프로필
 */
export const getUserProfile = async (userId: number, currentUserId?: number, lang?: Language): Promise<UserProfileWithFollowStatus> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            profileImageUrl: true,
            notifyLikes: true,
            notifyComments: true,
            notifyFollows: true,
            notifySeries: true,
        },
    });

    if (!user) {
        throw new Error(getErrorMessage('USER.NOT_FOUND', lang));
    }

    let isFollowed = false;
    if (currentUserId && currentUserId !== userId) {
        isFollowed = await isFollowing(currentUserId, userId);
    }

    // 본인 프로필인 경우에만 알림 설정을 포함
    const response: UserProfileWithFollowStatus = {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        isFollowed,
    };

    if (currentUserId === userId) {
        response.notifyLikes = user.notifyLikes;
        response.notifyComments = user.notifyComments;
        response.notifyFollows = user.notifyFollows;
        response.notifySeries = user.notifySeries;
    }

    return response;
};

/**
 * 사용자 프로필 정보를 업데이트합니다.
 * @param userId 사용자 ID
 * @param profileData 업데이트할 프로필 데이터
 * @returns 업데이트된 사용자 프로필
 */
export const updateUserProfile = async (
    userId: number,
    profileData: {
        username?: string;
        email?: string; 
        bio?: string; 
        profileImageUrl?: string;
        notifyLikes?: boolean;
        notifyComments?: boolean;
        notifyFollows?: boolean;
        notifySeries?: boolean;
    }) => {
    const { username, email, bio, profileImageUrl, notifyLikes, notifyComments, notifyFollows, notifySeries } = profileData;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            username,
            email,
            bio,
            profileImageUrl,
            notifyLikes,
            notifyComments,
            notifyFollows,
            notifySeries,
        },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            profileImageUrl: true,
            notifyLikes: true,
            notifyComments: true,
            notifyFollows: true,
            notifySeries: true,
        },
    });

    return updatedUser;
};

/**
 * 특정 사용자가 업로드한 사진 목록을 조회하는 서비스 함수
 * @param userId 조회할 사용자의 ID
 * @returns 해당 사용자의 사진 목록 (최신순)
 */
export const getUserPhotos = async (userId: number) => {
    return prisma.photo.findMany({
        where: {
            userId: userId,
            deletedAt: null, // 삭제되지 않은 사진만
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: { // 각 사진의 좋아요 수를 포함
            _count: {
                select: { likes: true },
            },
        },
    });
};

/**
 * 사용자를 소프트 삭제하는 서비스 함수 (deletedAt 필드 업데이트)
 * @param userId 삭제할 사용자의 ID
 * @returns 업데이트된 사용자 객체
 */
export const deleteUser = async (userId: number, lang?: Language) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error(getErrorMessage('USER.NOT_FOUND', lang));
    }

    return prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
        select: {
            id: true,
            username: true,
            email: true,
            deletedAt: true,
        },
    });
};
