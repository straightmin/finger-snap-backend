import { PrismaClient, User } from '@prisma/client';
import { isFollowing } from './follow.service';

const prisma = new PrismaClient();

type AuthorWithFollowStatus = Pick<User, 'id' | 'username'> & { profileImageUrl?: string | null; isFollowed: boolean };

/**
 * 새로운 시리즈를 생성합니다.
 * @param userId 시리즈를 생성하는 사용자 ID
 * @param title 시리즈 제목
 * @param description 시리즈 설명 (선택 사항)
 * @param coverPhotoId 시리즈 커버 사진 ID (선택 사항)
 * @param isPublic 시리즈 공개 여부 (선택 사항, 기본값 true)
 * @returns 생성된 시리즈 객체
 */
export const createSeries = async (
    userId: number,
    title: string,
    description?: string,
    coverPhotoId?: number,
    isPublic: boolean = true
) => {
    return prisma.series.create({
        data: {
            userId,
            title,
            description,
            coverPhotoId,
            isPublic,
        },
    });
};

/**
 * 특정 시리즈의 상세 정보를 조회합니다.
 * @param seriesId 시리즈 ID
 * @param currentUserId 현재 로그인된 사용자의 ID (선택 사항)
 * @returns 시리즈 객체 (사진 목록 포함) 또는 null
 */
export const getSeriesById = async (seriesId: number, currentUserId?: number) => {
    const series = await prisma.series.findUnique({
        where: { id: seriesId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profileImageUrl: true,
                },
            },
            coverPhoto: true,
            photos: {
                include: {
                    photo: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                            _count: {
                                select: { likes: true },
                            },
                        },
                    },
                },
                orderBy: {
                    position: 'asc', // position 필드로 정렬
                },
            },
        },
    });

    if (!series) {
        return null;
    }

    let authorWithFollowStatus: AuthorWithFollowStatus | undefined;
    if (series.author) {
        const followed = currentUserId ? await isFollowing(currentUserId, series.author.id) : false;
        authorWithFollowStatus = { ...series.author, isFollowed: followed };
    }

    const authorIds = new Set<number>();
    if (series.author) {
        authorIds.add(series.author.id);
    }
    series.photos.forEach((seriesPhoto) => {
        if (seriesPhoto.photo.author) {
            authorIds.add(seriesPhoto.photo.author.id);
        }
    });

    const followStatuses = currentUserId
        ? await prisma.follow.findMany({
              where: {
                  followerId: currentUserId,
                  followingId: { in: Array.from(authorIds) },
              },
              select: { followingId: true },
          })
        : [];

    const followStatusMap = new Map<number, boolean>();
    followStatuses.forEach((status) => {
        followStatusMap.set(status.followingId, true);
    });

    const photosWithFollowStatus = series.photos.map((seriesPhoto) => {
        let photoAuthorWithFollowStatus: AuthorWithFollowStatus | undefined;
        if (seriesPhoto.photo.author) {
            const isFollowed = followStatusMap.get(seriesPhoto.photo.author.id) || false;
            photoAuthorWithFollowStatus = { ...seriesPhoto.photo.author, isFollowed };
        }
        return {
            ...seriesPhoto,
            photo: {
                ...seriesPhoto.photo,
                author: photoAuthorWithFollowStatus,
            },
        };
    }));

    return { ...series, author: authorWithFollowStatus, photos: photosWithFollowStatus };
};

/**
 * 특정 사용자의 모든 시리즈 목록을 조회합니다.
 * @param userId 사용자 ID
 * @returns 시리즈 목록
 */
export const getUserSeries = async (userId: number, currentUserId?: number) => {
    const seriesList = await prisma.series.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            coverPhoto: true, // 커버 사진 정보 포함
            _count: {
                select: { photos: true }, // 시리즈에 포함된 사진 수
            },
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    const seriesWithFollowStatus = await Promise.all(seriesList.map(async (series) => {
        let authorWithFollowStatus: AuthorWithFollowStatus | undefined;
        if (series.author) {
            const followed = currentUserId ? await isFollowing(currentUserId, series.author.id) : false;
            authorWithFollowStatus = { ...series.author, isFollowed: followed };
        }
        return { ...series, author: authorWithFollowStatus };
    }));

    return seriesWithFollowStatus;
};

/**
 * 시리즈 정보를 업데이트합니다.
 * @param seriesId 시리즈 ID
 * @param data 업데이트할 데이터 (title, description, coverPhotoId, isPublic)
 * @returns 업데이트된 시리즈 객체
 */
export const updateSeries = async (
    seriesId: number,
    data: { title?: string; description?: string; coverPhotoId?: number; isPublic?: boolean }
) => {
    return prisma.series.update({
        where: { id: seriesId },
        data,
    });
};

/**
 * 시리즈를 삭제합니다. (시리즈에 연결된 사진들도 함께 삭제)
 * @param seriesId 시리즈 ID
 */
export const deleteSeries = async (seriesId: number) => {
    // SeriesPhoto 레코드 먼저 삭제
    await prisma.seriesPhoto.deleteMany({
        where: { seriesId },
    });
    // 시리즈 삭제
    return prisma.series.delete({
        where: { id: seriesId },
    });
};

/**
 * 시리즈에 사진을 추가합니다.
 * @param seriesId 시리즈 ID
 * @param photoId 사진 ID
 * @returns 추가된 SeriesPhoto 객체
 */
export const addPhotoToSeries = async (seriesId: number, photoId: number) => {
    // 현재 시리즈의 마지막 position 값을 찾아서 +1
    const lastPhoto = await prisma.seriesPhoto.findFirst({
        where: { seriesId },
        orderBy: { position: 'desc' },
    });
    const newPosition = lastPhoto ? lastPhoto.position + 1 : 0;

    return prisma.seriesPhoto.create({
        data: {
            seriesId,
            photoId,
            position: newPosition,
        },
    });
};

/**
 * 시리즈에서 사진을 제거합니다.
 * @param seriesId 시리즈 ID
 * @param photoId 사진 ID
 */
export const removePhotoFromSeries = async (seriesId: number, photoId: number) => {
    return prisma.seriesPhoto.delete({
        where: {
            seriesId_photoId: {
                seriesId,
                photoId,
            },
        },
    });
};

/**
 * 시리즈 내 사진들의 순서를 업데이트합니다.
 * @param seriesId 시리즈 ID
 * @param photoOrders { photoId: number, position: number }[]
 */
export const updateSeriesPhotoOrder = async (
    seriesId: number,
    photoOrders: { photoId: number; position: number }[]
) => {
    const transaction = photoOrders.map(order =>
        prisma.seriesPhoto.updateMany({
            where: {
                seriesId,
                photoId: order.photoId,
            },
            data: {
                position: order.position,
            },
        })
    );
    return prisma.$transaction(transaction);
};
