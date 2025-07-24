// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';
import * as photoService from '../services/photo.service';
import { getSuccessMessage } from "../utils/messageMapper";

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.user!.id;
    const profile = await userService.getUserProfile(userId, userId);
    res.status(200).json(profile);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { username, bio, profileImageUrl } = req.body;

    const updatedProfile = await userService.updateUserProfile(userId, {
        username,
        bio,
        profileImageUrl,
    });

    res.status(200).json(updatedProfile);
});

export const getMyPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const photos = await userService.getUserPhotos(userId);
    const photosWithLikeCount = photos.map(photo => ({
        ...photo,
        likesCount: photo._count.likes,
    }));
    res.status(200).json(photosWithLikeCount);
});

export const getMyLikedPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const likedPhotos = await photoService.getLikedPhotos(userId);

    // getLikedPhotos가 Like 객체 배열을 반환하므로, 각 Like에서 photo 정보를 추출합니다.
    const photos = likedPhotos.map(like => like.photo).filter(photo => photo !== null);

    res.status(200).json(photos);
});

export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.deleteUser(userId, req.lang);
    res.status(200).json({ message: getSuccessMessage("USER.ACCOUNT_DELETED", req.lang) });
});