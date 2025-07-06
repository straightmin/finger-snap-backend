// src/controllers/photo.controller.ts
import { Request, Response } from 'express';
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
