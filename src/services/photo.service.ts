import { PrismaClient, Photo, User } from '@prisma/client';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { bucketName } from '../lib/s3Client';
import { getMessage } from '../utils/messageMapper';
import config from '../config';
import { isFollowing } from './follow.service'; // isFollowing 함수 임포트

// Prisma 클라이언트 인스턴스를 생성합니다.
const prisma = new PrismaClient();

type AuthorWithFollowStatus = Pick<User, 'id' | 'username'> & { isFollowed: boolean };

/**
 * 정렬 기준에 따라 사진 목록을 조회하는 서비스 함수
 * @param sortBy 정렬 기준 문자열 ('popular' 또는 그 외)
 * @param currentUserId 현재 로그인된 사용자의 ID (선택 사항)
 * @returns 정렬된 사진 목록
 */
export const getPhotos = async (sortBy: string, currentUserId?: number) => {
    const whereCondition = {
        deletedAt: null, // 소프트 삭제된 사진은 제외
        isPublic: true, // 공개된 사진만 조회
    };

    let photos;

    // 'popular' (인기순)으로 정렬하는 경우
    if (sortBy === 'popular') {
        photos = await prisma.photo.findMany({
            where: whereCondition,
            include: {
                _count: {
                    select: { likes: true },
                },
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                likes: {
                    _count: 'desc',
                },
            },
        });
    } else {
        // 'latest' (최신순) 또는 그 외의 경우, 모든 사진을 최신순으로 정렬하여 반환합니다.
        photos = await prisma.photo.findMany({
            where: whereCondition,
            include: {
                _count: {
                    select: { likes: true },
                },
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // 각 사진의 작성자에 대한 팔로우 상태 추가
    const photosWithFollowStatus = await Promise.all(photos.map(async (photo) => {
        let authorWithFollowStatus: AuthorWithFollowStatus | undefined;
        if (photo.author) {
            const followed = currentUserId ? await isFollowing(currentUserId, photo.author.id) : false;
            authorWithFollowStatus = { ...photo.author, isFollowed: followed };
        }
        return { ...photo, author: authorWithFollowStatus };
    }));

    return photosWithFollowStatus;
};

/**
 * ID로 특정 사진의 상세 정보를 조회하는 서비스 함수
 * @param photoId 조회할 사진의 ID
 * @returns 사진, 작성자, 댓글(작성자 포함), 좋아요 정보를 포함하는 객체
 */
export const getPhotoById = async (photoId: number, currentUserId?: number) => {
    const photo = await prisma.photo.findFirst({
        where: { id: { equals: photoId }, deletedAt: null, isPublic: true },
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
            _count: {
                select: { likes: true }, // 좋아요 수 포함
            },
        },
    });

    if (!photo) {
        return null;
    }

    let authorWithFollowStatus: AuthorWithFollowStatus | undefined;
    if (photo.author) {
        const followed = currentUserId ? await isFollowing(currentUserId, photo.author.id) : false;
        authorWithFollowStatus = { ...photo.author, isFollowed: followed };
    }

    return { ...photo, author: authorWithFollowStatus };
};

/**
 * 새로운 사진을 업로드하고 데이터베이스에 생성하는 서비스 함수
 * @param photoData 사진 생성에 필요한 데이터 (title, description, file, userId)
 * @returns 생성된 사진 객체
 */
export const createPhoto = async (photoData: {
    title?: string;
    description?: string;
    file: Express.Multer.File;
    userId: number;
}) => {
    const { title, description, file, userId } = photoData;

    // 1. 원본 이미지 리사이징
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    let resizedBuffer = file.buffer;
    if (width && height && (width > 1920 || height > 1920)) {
        const resizeOptions = width > height ? { width: 1920 } : { height: 1920 };
        resizedBuffer = await image.resize(resizeOptions).toBuffer();
    }

    // 2. 썸네일 생성
    const thumbnailBuffer = await sharp(resizedBuffer)
        .resize(300, 300, { fit: 'cover' })
        .toBuffer();

    // 3. 원본과 썸네일을 S3에 병렬로 업로드
    const originalKey = `photos/${userId}/${Date.now()}-${file.originalname}`;
    const thumbnailKey = `thumbnails/${userId}/${Date.now()}-${file.originalname}`;

    const s3UploadParams = [
        {
            Bucket: bucketName,
            Key: originalKey,
            Body: resizedBuffer,
            ContentType: file.mimetype,
        },
        {
            Bucket: bucketName,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg', // 썸네일은 jpeg로 통일
        },
    ];

    await Promise.all(
        s3UploadParams.map(params => s3Client.send(new PutObjectCommand(params)))
    );

    const imageUrl = `https://${bucketName}.s3.${config.AWS_REGION}.amazonaws.com/${originalKey}`;
    const thumbnailUrl = `https://${bucketName}.s3.${config.AWS_REGION}.amazonaws.com/${thumbnailKey}`;

    // 4. DB에 사진 정보 저장
    return prisma.photo.create({
        data: {
            title: title || 'Untitled',
            description: description || null,
            imageUrl, // 원본 이미지 URL
            thumbnailUrl, // 썸네일 이미지 URL
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
        throw new Error(getMessage('PHOTO_NOT_FOUND'));
    }

    if (photo.userId !== userId) {
        throw new Error(getMessage('UNAUTHORIZED'));
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
        throw new Error(getMessage('PHOTO_NOT_FOUND'));
    }

    if (photo.userId !== userId) {
        throw new Error(getMessage('UNAUTHORIZED'));
    }

    return prisma.photo.update({
        where: { id: photoId },
        data: { isPublic },
    });
};

/**
 * 사용자가 좋아요를 누른 사진 목록을 조회하는 서비스 함수
 * @param userId 조회할 사용자의 ID
 * @returns 사용자가 좋아요를 누른 사진 목록
 */
export const getLikedPhotos = async (userId: number) => {
    return prisma.like.findMany({
        where: {
            userId: userId,
            photoId: { not: null }, // 사진에 대한 좋아요만 필터링
            photo: {
                deletedAt: null, // 삭제되지 않은 사진만
                isPublic: true, // 공개된 사진만
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
