// src/services/photo.service.ts
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스를 생성합니다.
const prisma = new PrismaClient();

/**
 * 정렬 기준에 따라 사진 목록을 조회하는 서비스 함수
 * @param sortBy 정렬 기준 문자열 ('popular' 또는 그 외)
 * @returns 정렬된 사진 목록
 */
export const getPhotos = async (sortBy: string) => {
    const whereCondition = {
        deletedAt: null, // 소프트 삭제된 사진은 제외
        isPublic: true, // 공개된 사진만 조회
    };

    // 'popular' (인기순)으로 정렬하는 경우
    if (sortBy === 'popular') {
        // Photo 모델을 직접 쿼리하면서, 관계된 PhotoLike의 개수(likes._count)를 기준으로 정렬합니다.
        // 이 방식은 좋아요가 없는 사진도 결과에 포함시킵니다.
        return prisma.photo.findMany({
            where: whereCondition,
            include: {
                // 좋아요 수를 계산하기 위해 likes 관계를 포함시킵니다.
                // 실제 좋아요 데이터를 모두 가져올 필요는 없으므로, select를 통해 필요한 정보만 제한할 수 있으나,
                // 여기서는 _count를 위해 전체를 포함합니다.
                likes: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                // likes 관계의 개수(count)를 기준으로 내림차순 정렬합니다.
                likes: {
                    _count: 'desc',
                },
            },
        });
    } else {
        // 'latest' (최신순) 또는 그 외의 경우, 모든 사진을 최신순으로 정렬하여 반환합니다.
        return prisma.photo.findMany({
            where: whereCondition,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc', // 생성일(createdAt) 기준으로 내림차순 정렬
            },
        });
    }
};

/**
 * ID로 특정 사진의 상세 정보를 조회하는 서비스 함수
 * @param photoId 조회할 사진의 ID
 * @returns 사진, 작성자, 댓글(작성자 포함), 좋아요 정보를 포함하는 객체
 */
export const getPhotoById = async (photoId: number) => {
    return prisma.photo.findUnique({
        where: { id: photoId, deletedAt: null, isPublic: true },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
            comments: {
                where: { deletedAt: null },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            likes: true, // 좋아요 정보 포함
        },
    });
};

/**
 * 새로운 사진 데이터를 데이터베이스에 생성하는 서비스 함수
 * @param photoData 사진 생성에 필요한 데이터 (title, description, imageUrl, userId)
 * @returns 생성된 사진 객체
 */
export const createPhoto = async (photoData: {
    title?: string;
    description?: string;
    imageUrl: string;
    userId: number;
}) => {
    const { title, description, imageUrl, userId } = photoData;

    return prisma.photo.create({
        data: {
            title: title || 'Untitled',
            description: description || null,
            imageUrl,
            thumbnailUrl: imageUrl, // 우선 원본 이미지 URL을 썸네일로 사용
            userId,
        },
    });
};

/**
 * 사진을 삭제하는 서비스 함수 (소프트 삭제)
 * @param photoId 삭제할 사진의 ID
 * @param userId 요청한 사용자의 ID
 * @returns 업데이트된 사진 객체
 * @throws Error 사진이 존재하지 않거나 권한이 없는 경우
 */
export const deletePhoto = async (photoId: number, userId: number) => {
    const photo = await prisma.photo.findUnique({
        where: { id: photoId },
    });

    if (!photo) {
        throw new Error('PHOTO_NOT_FOUND');
    }

    if (photo.userId !== userId) {
        throw new Error('UNAUTHORIZED');
    }

    return prisma.photo.update({
        where: { id: photoId },
        data: { deletedAt: new Date() },
    });
};

/**
 * 사진의 공개 상태를 변경하는 서비스 함수
 * @param photoId 사진 ID
 * @param userId 요청한 사용자의 ID
 * @param isPublic 새로운 공개 상태
 * @returns 업데이트된 사진 객체
 * @throws Error 사진이 존재하지 않거나 권한이 없는 경우
 */
export const updatePhotoVisibility = async (photoId: number, userId: number, isPublic: boolean) => {
    const photo = await prisma.photo.findUnique({
        where: { id: photoId },
    });

    if (!photo) {
        throw new Error('PHOTO_NOT_FOUND');
    }

    if (photo.userId !== userId) {
        throw new Error('UNAUTHORIZED');
    }

    return prisma.photo.update({
        where: { id: photoId },
        data: { isPublic },
    });
};
