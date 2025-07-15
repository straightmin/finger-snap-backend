import { getMessage } from '../utils/messageMapper';
import { getPrismaClient } from './prismaClient';

const prisma = getPrismaClient();

export const togglePhotoLike = async (userId: number, photoId: number) => {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new Error(getMessage('PHOTO_NOT_FOUND'));
  }

  // 삭제된 사진에는 좋아요 불가
  if (photo.deletedAt) {
    throw new Error(getMessage('PHOTO_IS_DELETED'));
  }

  // 사진 소유자는 공개 여부와 상관없이 좋아요 가능
  if (photo.userId !== userId && !photo.isPublic) {
    throw new Error(getMessage('PHOTO_IS_PRIVATE'));
  }

  const existingLike = await prisma.photoLike.findUnique({
    where: {
      userId_photoId: {
        userId,
        photoId,
      },
    },
  });

  if (existingLike) {
    await prisma.photoLike.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { message: 'Photo unliked', liked: false };
  } else {
    await prisma.photoLike.create({
      data: {
        userId,
        photoId,
      },
    });
    return { message: 'Photo liked', liked: true };
  }
};

export const toggleCommentLike = async (userId: number, commentId: number) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error(getMessage('COMMENT_NOT_FOUND'));
  }

  // 삭제된 댓글에는 좋아요 불가
  if (comment.deletedAt) {
    throw new Error(getMessage('COMMENT_IS_DELETED'));
  }

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { message: 'Comment unliked', liked: false };
  } else {
    await prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });
    return { message: 'Comment liked', liked: true };
  }
};
