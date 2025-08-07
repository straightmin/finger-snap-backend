// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';
import * as photoService from '../services/photo.service';
import { getSuccessMessage } from '../utils/messageMapper';

/**
 * 현재 사용자의 프로필 정보를 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 사용자 프로필 정보
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.user!.id;
    const profile = await userService.getUserProfile(userId, userId);
    res.status(200).json(profile);
});

/**
 * 현재 사용자의 프로필 정보를 업데이트합니다.
 * @param req HTTP 요청 객체 (username, bio, profileImageUrl 포함)
 * @param res HTTP 응답 객체
 * @returns 업데이트된 프로필 정보
 */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { username, bio, profileImageUrl, notifyLikes, notifyComments, notifyFollows, notifySeries } = req.body;

    const updatedProfile = await userService.updateUserProfile(userId, {
        username,
        bio,
        profileImageUrl,
        notifyLikes,
        notifyComments,
        notifyFollows,
        notifySeries,
    });

    res.status(200).json(updatedProfile);
});

/**
 * 현재 사용자가 업로드한 사진 목록을 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 사용자의 사진 목록
 */
export const getMyPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const photos = await userService.getUserPhotos(userId);
    const photosWithLikeCount = photos.map(photo => ({
        ...photo,
        likesCount: photo._count.likes,
    }));
    res.status(200).json(photosWithLikeCount);
});

/**
 * 현재 사용자가 좋아요를 누른 사진 목록을 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 좋아요한 사진 목록
 */
export const getMyLikedPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const likedPhotos = await photoService.getLikedPhotos(userId);

    // getLikedPhotos가 Like 객체 배열을 반환하므로, 각 Like에서 photo 정보를 추출합니다.
    const photos = likedPhotos.map(like => like.photo).filter(photo => photo !== null);

    res.status(200).json(photos);
});

/**
 * 현재 사용자의 알림 설정을 업데이트합니다.
 * @param req HTTP 요청 객체 (알림 설정 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 업데이트된 알림 설정
 */
export const updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notifyLikes, notifyComments, notifyFollows, notifySeries } = req.body;

    const updatedProfile = await userService.updateUserProfile(userId, {
        notifyLikes,
        notifyComments,
        notifyFollows,
        notifySeries,
    });

    res.status(200).json({
        message: getSuccessMessage('NOTIFICATION_PREFERENCES_UPDATED', req.lang),
        notificationPreferences: {
            notifyLikes: updatedProfile.notifyLikes,
            notifyComments: updatedProfile.notifyComments,
            notifyFollows: updatedProfile.notifyFollows,
            notifySeries: updatedProfile.notifySeries,
        }
    });
});

/**
 * 현재 사용자의 계정을 삭제합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 계정 삭제 성공 메시지
 */
export const deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.deleteUser(userId, req.lang);
    res.status(200).json({ message: getSuccessMessage('USER.ACCOUNT_DELETED', req.lang) });
});