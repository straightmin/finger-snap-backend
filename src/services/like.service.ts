import { getPrismaClient } from './prismaClient';

const prisma = getPrismaClient();

export const togglePhotoLike = async (userId: number, photoId: number) => {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new Error('Photo not found');
  }

  // 삭제된 사진에는 좋아요 불가
  if (photo.deletedAt) {
    throw new Error('Photo is deleted');
  }

  // 사진 소유자는 공개 여부와 상관없이 좋아요 가능
  if (photo.userId !== userId && !photo.isPublic) {
    throw new Error('Photo is private');
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
    throw new Error('Comment not found');
  }

  // 삭제된 댓글에는 좋아요 불가
  if (comment.deletedAt) {
    throw new Error('Comment is deleted');
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
