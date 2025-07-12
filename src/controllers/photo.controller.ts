// src/controllers/photo.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as photoService from '../services/photo.service';

/**
 * 사진 목록을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.query.sortBy`로 정렬 기준을 받습니다.
 * @param res Express의 Response 객체. 조회된 사진 목록 또는 에러 메시지를 반환합니다.
 */
export const getPhotos = async (req: Request, res: Response) => {
    // URL 쿼리 파라미터에서 `sortBy` 값을 가져옵니다. (e.g., /api/photos?sortBy=popular)
    const sortBy = req.query.sortBy as string;

    try {
        // photoService의 getPhotos 함수를 호출하여 사진 데이터를 가져옵니다.
        const photos = await photoService.getPhotos(sortBy);
        // 성공적으로 조회되면 상태 코드 200과 함께 사진 데이터를 JSON 형태로 응답합니다.
        res.status(200).json(photos);
    } catch (error) {
        // 에러가 발생하면 상태 코드 500과 함께 에러 메시지를 응답합니다.
        res.status(500).json({ message: 'ERROR_FETCHING_PHOTOS', error });
    }
};

/**
 * ID로 특정 사진을 조회하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID를 받습니다.
 * @param res Express의 Response 객체. 조회된 사진 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const getPhotoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoId = parseInt(req.params.id, 10);
        const photo = await photoService.getPhotoById(photoId);

        if (!photo) {
            res.status(404).json({ message: 'PHOTO_NOT_FOUND' });
            return;
        }

        res.status(200).json(photo);
    } catch (error) {
        next(error);
    }
};

/**
 * 사진을 업로드하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.file`로 업로드된 파일 정보, `req.body`로 제목/설명, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 생성된 사진 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'PHOTO_IS_REQUIRED' });
        }

        const { title, description } = req.body;
        const userId = req.user!.id;
        const imageUrl = (req.file as any).location; // multer-s3는 location 속성에 URL을 담아줌

        const photoData = {
            title,
            description,
            imageUrl,
            userId,
        };

        const newPhoto = await photoService.createPhoto(photoData);
        res.status(201).json(newPhoto);
    } catch (error) {
        next(error);
    }
};

/**
 * 사진의 공개 상태를 변경하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID, `req.body.isPublic`으로 공개 여부, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 업데이트된 사진 정보 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const updatePhotoVisibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoId = parseInt(req.params.id, 10);
        const { isPublic } = req.body;
        const userId = req.user!.id;

        if (typeof isPublic !== 'boolean') {
            res.status(400).json({ message: 'IS_PUBLIC_FIELD_IS_REQUIRED_AND_MUST_BE_A_BOOLEAN' });
            return;
        }

        const updatedPhoto = await photoService.updatePhotoVisibility(photoId, userId, isPublic);

        res.status(200).json(updatedPhoto);
    } catch (error) {
        next(error);
    }
};

/**
 * 사진을 삭제하는 컨트롤러 함수
 * @param req Express의 Request 객체. `req.params.id`로 사진 ID, `req.user`로 인증된 사용자 정보를 받습니다.
 * @param res Express의 Response 객체. 성공 메시지 또는 에러 메시지를 반환합니다.
 * @param next Express의 NextFunction 객체. 에러 처리를 위해 사용됩니다.
 */
export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photoId = parseInt(req.params.id, 10);
        const userId = req.user!.id;

        await photoService.deletePhoto(photoId, userId);

        res.status(200).json({ message: 'PHOTO_DELETED_SUCCESSFULLY' });
    } catch (error) {
        next(error);
    }
};
