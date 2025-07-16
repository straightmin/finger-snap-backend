import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
export const togglePhotoInDefaultCollection = async (userId: number, photoId: number) => {
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
        return { added: false, message: '사진이 컬렉션에서 제거되었습니다.' };
    } else {
        // 컬렉션에 없으면 추가
        await prisma.collectionPhoto.create({
            data: {
                collectionId: collection.id,
                photoId: photoId,
            },
        });
        return { added: true, message: '사진이 컬렉션에 추가되었습니다.' };
    }
};

/**
 * 사용자의 기본 컬렉션에 있는 사진 목록을 조회합니다.
 * @param userId 사용자 ID
 * @returns 컬렉션에 담긴 사진 목록
 */
export const getDefaultCollectionPhotos = async (userId: number) => {
    const collection = await findOrCreateDefaultCollection(userId);

    return prisma.collectionPhoto.findMany({
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
};