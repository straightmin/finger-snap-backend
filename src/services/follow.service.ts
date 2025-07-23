// src/services/follow.service.ts
import { getPrismaClient } from './prismaClient';
import * as notificationService from './notification.service';
import { getSuccessMessage, getErrorMessage } from '../utils/messageMapper';

// Prisma 클라이언트 인스턴스를 생성합니다.
const prisma = getPrismaClient();

/**
 * 팔로우/언팔로우 토글 기능을 구현하는 서비스 함수
 * @param followerId 팔로워의 사용자 ID
 * @param followingId 토글할 사용자의 ID
 * @returns 현재 팔로우 상태 (true: 팔로우, false: 언팔로우)와 메시지를 담은 객체
 */
export const toggleFollow = async (followerId: number, followingId: number) => {
    if (followerId === followingId) {
        throw new Error(getErrorMessage('FOLLOW.CANNOT_FOLLOW_SELF'));
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    if (existingFollow) {
        // 언팔로우
        await prisma.follow.delete({
            where: {
                id: existingFollow.id,
            },
        });
        return { isFollowing: false, message: getSuccessMessage('FOLLOW.UNFOLLOWED') };
    } else {
        // 팔로우
        const newFollow = await prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });

        // 알림 생성
        await notificationService.createNotification({
            userId: followingId,
            actorId: followerId,
            eventType: 'FOLLOW',
            followId: newFollow.id,
        });

        return { isFollowing: true, message: getSuccessMessage('FOLLOW.FOLLOWED') };
    }
};

/**
 * 특정 사용자의 팔로워 목록을 조회하는 서비스 함수
 * @param userId 조회할 사용자의 ID
 * @returns 팔로워 목록
 */
export const getFollowers = async (userId: number) => {
    // 팔로워 목록 조회
    return prisma.follow.findMany({
        where: {
            followingId: userId,
        },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    // profilePicture: true, // 프로필 사진 추가 가능
                },
            },
        },
    });
};

/**
 * 특정 사용자가 팔로우하는 사용자 목록을 조회하는 서비스 함수
 * @param userId 조회할 사용자의 ID
 * @returns 팔로우하는 사용자 목록
 */
export const getFollowing = async (userId: number) => {
    // 팔로우하는 사용자 목록 조회
    return prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        include: {
            following: {
                select: {
                    id: true,
                    username: true,
                    // profilePicture: true, // 프로필 사진 추가 가능
                },
            },
        },
    });
};

/**
 * 특정 사용자가 다른 사용자를 팔로우하고 있는지 확인하는 서비스 함수
 * @param followerId 팔로워의 사용자 ID
 * @param followingId 팔로우할 사용자의 ID
 * @returns 팔로우 여부
 */
export const isFollowing = async (followerId: number, followingId: number) => {
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
    return !!follow;
};