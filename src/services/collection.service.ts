import { PrismaClient, User } from '@prisma/client';
import { isFollowing } from './follow.service';
import { getSuccessMessage, Language } from "../utils/messageMapper";

const prisma = new PrismaClient();

type AuthorWithFollowStatus = Pick<User, 'id' | 'username'> & { isFollowed: boolean };
type OwnerWithFollowStatus = Pick<User, 'id' | 'username'> & { isFollowed: boolean };

/**
 * 사용자의 기본 컬렉션을 찾거나 생성합니다.
 * @param userId 사용자 ID
 * @returns 기본 컬렉션 객체
 */
const findOrCreateDefaultCollection = async (userId: number) => {
    let collection = await prisma.collection.findFirst({
        where: {
            userId: userId,
            title: '저장한 사진', // 기본 컬렉션의 이름
        },
    });

    if (!collection) {
        collection = await prisma.collection.create({
            data: {
                userId: userId,
                title: '저장한 사진',
                description: '사용자가 저장한 사진들을 모아둔 기본 컬렉션입니다.',
            },
        });
    }
    return collection;
};

/**
 * 사진을 기본 컬렉션에 추가하거나 제거합니다. (토글)
 * @param userId 사용자 ID
 * @param photoId 사진 ID
 * @returns 컬렉션 추가/제거 성공 여부
 */
export const togglePhotoInDefaultCollection = async (userId: number, photoId: number, lang: Language) => {
    const collection = await findOrCreateDefaultCollection(userId);

    const existingCollectionPhoto = await prisma.collectionPhoto.findUnique({
        where: {
            collectionId_photoId: {
                collectionId: collection.id,
                photoId: photoId,
            },
        },
    });

    if (existingCollectionPhoto) {
        // 이미 컬렉션에 있으면 제거
        await prisma.collectionPhoto.delete({
            where: { id: existingCollectionPhoto.id },
        });
        return { added: false, message: getSuccessMessage("COLLECTION.PHOTO_REMOVED", lang) };
    } else {
        // 컬렉션에 없으면 추가
        await prisma.collectionPhoto.create({
            data: {
                collectionId: collection.id,
                photoId: photoId,
            },
        });
        return { added: true, message: getSuccessMessage("COLLECTION.PHOTO_ADDED", lang) };
    }
};

/**
 * 사용자의 기본 컬렉션에 있는 사진 목록을 조회합니다.
 * @param userId 사용자 ID
 * @param currentUserId 현재 로그인된 사용자의 ID (선택 사항)
 * @returns 컬렉션에 담긴 사진 목록
 */
export const getDefaultCollectionPhotos = async (userId: number, currentUserId?: number) => {
    const collection = await findOrCreateDefaultCollection(userId);

    const collectionPhotos = await prisma.collectionPhoto.findMany({
        where: {
            collectionId: collection.id,
            photo: {
                deletedAt: null, // 삭제되지 않은 사진만
            },
        },
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
            createdAt: 'desc',
        },
    });

    const authorIds = Array.from(new Set(collectionPhotos.map(cp => cp.photo.author?.id).filter(id => id !== undefined)));
    const followStatuses = currentUserId
        ? await prisma.follow.findMany({
            where: {
                followerId: currentUserId,
                followingId: { in: authorIds },
            },
            select: { followingId: true },
        })
        : [];

    const followedAuthorIds = new Set(followStatuses.map(f => f.followingId));

    const photosWithFollowStatus = collectionPhotos.map(cp => {
        let authorWithFollowStatus: AuthorWithFollowStatus | undefined;
        if (cp.photo.author) {
            const isFollowed = currentUserId ? followedAuthorIds.has(cp.photo.author.id) : false;
            authorWithFollowStatus = { ...cp.photo.author, isFollowed };
        }
        return {
            ...cp,
            photo: {
                ...cp.photo,
                author: authorWithFollowStatus,
            },
        };
    });

    return photosWithFollowStatus;
};

/**
 * 새로운 컬렉션을 생성합니다.
 * @param userId 사용자 ID
 * @param title 컬렉션 제목
 * @param description 컬렉션 설명
 * @returns 생성된 컬렉션 객체
 */
export const createCollection = async (userId: number, title: string, description?: string) => {
    return prisma.collection.create({
        data: {
            userId,
            title,
            description,
        },
    });
};

/**
 * 특정 사용자의 모든 컬렉션을 조회합니다.
 * @param userId 사용자 ID
 * @returns 해당 사용자의 모든 컬렉션 목록
 */
export const getUserCollections = async (userId: number) => {
    return prisma.collection.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

/**
 * ID로 특정 컬렉션의 상세 정보와 사진 목록을 조회합니다.
 * @param collectionId 컬렉션 ID
 * @returns 컬렉션 상세 정보 (사진 목록 포함)
 */
export const getCollectionDetails = async (collectionId: number, currentUserId?: number) => {
    const collection = await prisma.collection.findUnique({
        where: {
            id: collectionId,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                },
            },
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
                    createdAt: 'desc',
                },
            },
        },
    });

    if (!collection) {
        return null;
    }

    let ownerWithFollowStatus: OwnerWithFollowStatus | undefined;
    const authorIds = new Set<number>();

    if (collection.owner) {
        authorIds.add(collection.owner.id);
    }

    collection.photos.forEach((cp) => {
        if (cp.photo.author) {
            authorIds.add(cp.photo.author.id);
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

    if (collection.owner) {
        ownerWithFollowStatus = {
            ...collection.owner,
            isFollowed: followStatusMap.get(collection.owner.id) || false,
        };
    }

    const photosWithFollowStatus = collection.photos.map((cp) => {
        let photoAuthorWithFollowStatus: AuthorWithFollowStatus | undefined;
        if (cp.photo.author) {
            photoAuthorWithFollowStatus = {
                ...cp.photo.author,
                isFollowed: followStatusMap.get(cp.photo.author.id) || false,
            };
        }
        return {
            ...cp,
            photo: {
                ...cp.photo,
                author: photoAuthorWithFollowStatus,
            },
        };
    });

    return { ...collection, owner: ownerWithFollowStatus, photos: photosWithFollowStatus };
};

/**
 * 컬렉션 정보를 수정합니다.
 * @param collectionId 컬렉션 ID
 * @param title 새로운 제목
 * @param description 새로운 설명
 * @returns 수정된 컬렉션 객체
 */
export const updateCollection = async (collectionId: number, title: string, description?: string) => {
    return prisma.collection.update({
        where: {
            id: collectionId,
        },
        data: {
            title,
            description,
        },
    });
};

/**
 * 컬렉션을 삭제합니다.
 * @param collectionId 컬렉션 ID
 */
export const deleteCollection = async (collectionId: number) => {
    // 연결된 CollectionPhoto 레코드를 먼저 삭제합니다.
    await prisma.collectionPhoto.deleteMany({
        where: {
            collectionId,
        },
    });

    // 그 다음 컬렉션을 삭제합니다.
    return prisma.collection.delete({
        where: {
            id: collectionId,
        },
    });
};

/**
 * 특정 컬렉션에 사진을 추가합니다.
 * @param collectionId 컬렉션 ID
 * @param photoId 사진 ID
 * @returns 추가된 사진 정보 또는 null (이미 존재하는 경우)
 */
export const addPhotoToCollection = async (collectionId: number, photoId: number) => {
    const existing = await prisma.collectionPhoto.findUnique({
        where: {
            collectionId_photoId: {
                collectionId,
                photoId,
            },
        },
    });

    if (existing) {
        return null; // 이미 존재함
    }

    return prisma.collectionPhoto.create({
        data: {
            collectionId,
            photoId,
        },
    });
};

/**
 * 특정 컬렉션에서 사진을 제거합니다.
 * @param collectionId 컬렉션 ID
 * @param photoId 사진 ID
 */
export const removePhotoFromCollection = async (collectionId: number, photoId: number) => {
    return prisma.collectionPhoto.delete({
        where: {
            collectionId_photoId: {
                collectionId,
                photoId,
            },
        },
    });
};