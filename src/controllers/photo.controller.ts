// src/controllers/photo.controller.ts
import { Request, Response } from 'express';
import * as photoService from '../services/photo.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getPhotos = asyncHandler(async (req: Request, res: Response) => {
    const sortBy = req.query.sortBy as string;

    const photos = await photoService.getPhotos(sortBy);
    const photosWithLikeCount = photos.map(photo => ({
        ...photo,
        likesCount: photo._count.likes,
    }));

    res.status(200).json(photosWithLikeCount);
});

/**
 * ID로 특정 사진을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID를 받습니다.
 * @param res Express의 Response 객체. 조회된 사진 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const getPhotoById = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);

    if (isNaN(photoId)) {
        return res.status(400).json({ message: 'Invalid photo ID' });
    }

    const photo = await photoService.getPhotoById(photoId);

    if (!photo) {
        res.status(404).json({ message: 'PHOTO_NOT_FOUND' });
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
 * 사진을 업로드하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.file`로 업로드된 파일 정보, `req.body`로 제목/설명, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 생성된 사진 정보 또는 에러 메시지를 반환합니다.
 */
export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: 'PHOTO_IS_REQUIRED' });
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
 * 사진의 공개 상태를 변경하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID, `req.body.isPublic`으로 공개 여부, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 업데이트된 사진 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const updatePhotoVisibility = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const { isPublic } = req.body;
    const userId = req.user!.id;

    if (typeof isPublic !== 'boolean') {
        res.status(400).json({ message: 'IS_PUBLIC_FIELD_IS_REQUIRED_AND_MUST_BE_A_BOOLEAN' });
        return;
    }

    const updatedPhoto = await photoService.updatePhotoVisibility(photoId, userId, isPublic);

    res.status(200).json(updatedPhoto);
});

/**
 * 사진을 삭제하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 성공 메시지 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const deletePhoto = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    await photoService.deletePhoto(photoId, userId);

    res.status(200).json({ message: 'PHOTO_DELETED_SUCCESSFULLY' });
});

/**
 * 사용자가 좋아요를 누른 사진 목록을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 조회된 사진 목록 또는 에러 메시지를 반환합니다.
 */
export const getLikedPhotos = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const likedPhotos = await photoService.getLikedPhotos(userId);

    const photosWithLikeCount = likedPhotos.map(likedPhoto => ({
        ...likedPhoto.photo,
        likesCount: likedPhoto.photo._count.likes,
    }));

    res.status(200).json(photosWithLikeCount);
});
