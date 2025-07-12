import { Request, Response } from 'express';
import * as likeService from '../services/like.service';
import { getPrismaClient } from '../services/prismaClient';

const prisma = getPrismaClient();

import { asyncHandler } from '../utils/asyncHandler';

export const toggleLike = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.id;
  const { photoId, commentId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!photoId && !commentId) {
    return res.status(400).json({ message: 'photoId or commentId is required' });
  }

  if (photoId && commentId) {
    return res.status(400).json({ message: 'Only one of photoId or commentId can be provided' });
  }

  let result;
  if (photoId) {
    result = await likeService.togglePhotoLike(userId, photoId);
  } else if (commentId) {
    result = await likeService.toggleCommentLike(userId, commentId);
  }

  res.status(200).json(result);
});
