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
