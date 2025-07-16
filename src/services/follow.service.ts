// src/services/follow.service.ts
import { getPrismaClient } from './prismaClient';

// Prisma 클라이언트 인스턴스를 생성합니다.
const prisma = getPrismaClient();

/**
 * 팔로우 기능을 구현하는 서비스 함수
 * @param followerId 팔로워의 사용자 ID
 * @param followingId 팔로우할 사용자의 ID
 * @returns 팔로우 정보
 */
export const followUser = async (followerId: number, followingId: number) => {
    // 팔로우할 사용자와 팔로워가 동일한 경우 예외 처리
    if (followerId === followingId) {
        throw new Error('CANNOT_FOLLOW_YOURSELF');
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    // 이미 팔로우 중인 경우 예외 처리
    if (existingFollow) {
        throw new Error('ALREADY_FOLLOWING_THIS_USER');
    }

    // 팔로우 생성
    return prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });
};

/**
 * 언팔로우 기능을 구현하는 서비스 함수
 * @param followerId 팔로워의 사용자 ID
 * @param followingId 팔로우를 취소할 사용자의 ID
 * @returns 언팔로우 정보
 */
export const unfollowUser = async (followerId: number, followingId: number) => {
    // 팔로우할 사용자와 팔로워가 동일한 경우 예외 처리
    if (followerId === followingId) {
        throw new Error('CANNOT_UNFOLLOW_YOURSELF');
    }

    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    // 팔로우 중이지 않은 경우 예외 처리
    if (!existingFollow) {
        throw new Error('Not following this user.');
    }

    // 팔로우 삭제
    return prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
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