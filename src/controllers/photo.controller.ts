// src/controllers/photo.controller.ts
import { Request, Response } from 'express';
import * as photoService from '../services/photo.service';
import { asyncHandler } from '../utils/asyncHandler';
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

/**
 * 사진 목록을 조회합니다.
 * @param req HTTP 요청 객체 (sortBy 쿼리 파라미터 포함)
 * @param res HTTP 응답 객체
 * @returns 사진 목록
 */
export const getPhotos = asyncHandler(async (req: Request, res: Response) => {
    const sortBy = req.query.sortBy as string;
    const currentUserId = req.user?.id;

    const photos = await photoService.getPhotos(sortBy, currentUserId);
    const photosWithLikeCount = photos.map(photo => ({
        ...photo,
        likesCount: photo._count.likes,
    }));

    res.status(200).json(photosWithLikeCount);
});

/**
 * ID로 특정 사진을 조회합니다.
 * @param req HTTP 요청 객체 (사진 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 사진 상세 정보
 */
export const getPhotoById = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id;

    if (isNaN(photoId)) {
        return res.status(400).json({ message: getErrorMessage("PHOTO.INVALID_ID", req.lang) });
    }

    const photo = await photoService.getPhotoById(photoId, currentUserId);

    if (!photo) {
        res.status(404).json({ message: getErrorMessage("PHOTO.NOT_FOUND", req.lang) });
        return;
    }

    const { _count, ...photoWithoutCount } = photo;
    const photoWithLikeCount = {
        ...photoWithoutCount,
        likesCount: _count.likes,
    };

    res.status(200).json(photoWithLikeCount);
});

/**
 * 사진을 업로드합니다.
 * @param req HTTP 요청 객체 (파일, title, description 포함)
 * @param res HTTP 응답 객체
 * @returns 생성된 사진 정보
 */
export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: getErrorMessage("PHOTO.REQUIRED", req.lang) });
        return;
    }

    const { title, description } = req.body;
    const userId = req.user!.id;

    const photoData = {
        title,
        description,
        file: req.file,
        userId,
    };

    const newPhoto = await photoService.createPhoto(photoData);
    res.status(201).json(newPhoto);
});

/**
 * 사진의 공개 상태를 변경합니다.
 * @param req HTTP 요청 객체 (사진 ID, isPublic 값 포함)
 * @param res HTTP 응답 객체
 * @returns 업데이트된 사진 정보
 */
export const updatePhotoVisibility = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const { isPublic } = req.body;
    const userId = req.user!.id;

    if (typeof isPublic !== 'boolean') {
        res.status(400).json({ message: getErrorMessage("PHOTO.IS_PUBLIC_REQUIRED", req.lang) });
        return;
    }

    const updatedPhoto = await photoService.updatePhotoVisibility(photoId, userId, isPublic, req.lang || 'ko');

    res.status(200).json(updatedPhoto);
});

/**
 * 사진을 삭제합니다.
 * @param req HTTP 요청 객체 (사진 ID 포함)
 * @param res HTTP 응답 객체
 * @returns 삭제 성공 메시지
 */
export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    await photoService.deletePhoto(photoId, userId, req.lang || 'ko');

    res.status(200).json({ message: getSuccessMessage("PHOTO.DELETED", req.lang) });
});

/**
 * 사용자가 좋아요를 누른 사진 목록을 조회합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 좋아요한 사진 목록
 */
export const getLikedPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const likedPhotos = await photoService.getLikedPhotos(userId);

    // getLikedPhotos가 Like 객체 배열을 반환하므로, 각 Like에서 photo 정보를 추출합니다.
    const photos = likedPhotos.map(like => like.photo).filter(photo => photo !== null);

    res.status(200).json(photos);
});
