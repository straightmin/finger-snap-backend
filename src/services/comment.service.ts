import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCommentData {
    photoId: number;
    userId: number;
    content: string;
    parentId?: number;
}

/**
 * 새로운 댓글을 데이터베이스에 생성하는 서비스 함수
 * @param data 댓글 생성에 필요한 데이터 (photoId, userId, content, parentId)
 * @returns 생성된 댓글 객체
 * @throws Error 사진이 존재하지 않거나 부모 댓글이 존재하지 않는 경우
 */
export const createComment = async (data: CreateCommentData) => {
    const { photoId, userId, content, parentId } = data;

    // 1. 사진 존재 여부 확인
    const photo = await prisma.photo.findUnique({
        where: { id: photoId, deletedAt: null },
    });

    if (!photo) {
        throw new Error('PHOTO_NOT_FOUND');
    }

    // 2. 부모 댓글이 지정된 경우, 부모 댓글 존재 여부 확인
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({
            where: { id: parentId, deletedAt: null },
        });

        if (!parentComment) {
            throw new Error('PARENT_COMMENT_NOT_FOUND');
        }
        // 부모 댓글의 photoId와 현재 댓글의 photoId가 일치하는지 확인 (선택 사항이지만 유효성 강화)
        if (parentComment.photoId !== photoId) {
            throw new Error('PARENT_COMMENT_DOES_NOT_BELONG_TO_THIS_PHOTO');
        }
    }

    // 3. 댓글 생성
    return prisma.comment.create({
        data: {
            photoId,
            userId,
            content,
            parentId,
        },
    });
};

/**
 * 특정 사진의 댓글을 조회하는 서비스 함수
 * @param photoId 조회할 사진의 ID
 * @returns 계층적으로 구성된 댓글 목록
 */
export const getCommentsByPhotoId = async (photoId: number) => {
    // 1. 해당 사진의 모든 댓글을 가져옵니다. (삭제되지 않은 댓글만)
    const comments = await prisma.comment.findMany({
        where: {
            photoId,
            deletedAt: null,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc', // 시간 순으로 정렬
        },
    });

    // 2. 댓글들을 계층적으로 구성합니다.
    const commentMap = new Map<number, any>();
    const rootComments: any[] = [];

    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
                parent.replies.push(commentMap.get(comment.id));
            }
        } else {
            rootComments.push(commentMap.get(comment.id));
        }
    });

    return rootComments;
};
