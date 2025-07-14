// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            photos: {
                select: {
                    id: true,
                },
            },
            photoLikes: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // 사용자가 올린 사진 수
    const uploadedPhotosCount = user.photos.length;

    // 사용자가 받은 좋아요 수 (자신이 올린 사진에 달린 좋아요 수)
    const receivedLikesCount = await prisma.photoLike.count({
        where: {
            photo: {
                userId: userId,
            },
        },
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        uploadedPhotosCount,
        receivedLikesCount,
    };
};
