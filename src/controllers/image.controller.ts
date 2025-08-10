import { Request, Response, NextFunction } from 'express';
import { getImageFromS3, getPhotoS3Keys } from '../services/photo.service';
import { Readable } from 'stream';

/**
 * 비동기 함수를 래핑하여 에러 핸들링을 자동화하는 유틸리티
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

/**
 * 사진 이미지 프록시
 */
export const getPhotoImage = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.photoId);
    
    if (!photoId) {
        return res.status(400).json({ message: '유효하지 않은 사진 ID입니다.' });
    }

    const { imageKey } = await getPhotoS3Keys(photoId);
    
    if (!imageKey) {
        return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
    }

    const imageData = await getImageFromS3(imageKey);

    // 캐싱 헤더 설정
    res.set({
        'Content-Type': imageData.contentType || 'image/jpeg',
        'Content-Length': imageData.contentLength?.toString(),
        'Cache-Control': 'public, max-age=86400', // 24시간 캐싱
        'Last-Modified': imageData.lastModified?.toUTCString(),
    });

    // 이미지 스트림을 브라우저로 전송
    if (imageData.body) {
        // AWS SDK v3의 스트림을 Node.js Readable 스트림으로 변환
        const stream = imageData.body as Readable;
        stream.pipe(res);
    } else {
        return res.status(500).json({ message: '이미지 데이터를 읽을 수 없습니다.' });
    }
});

/**
 * 썸네일 이미지 프록시
 */
export const getThumbnailImage = asyncHandler(async (req: Request, res: Response) => {
    const photoId = parseInt(req.params.photoId);
    
    if (!photoId) {
        return res.status(400).json({ message: '유효하지 않은 사진 ID입니다.' });
    }

    const { thumbnailKey } = await getPhotoS3Keys(photoId);
    
    if (!thumbnailKey) {
        return res.status(404).json({ message: '썸네일을 찾을 수 없습니다.' });
    }

    const imageData = await getImageFromS3(thumbnailKey);

    res.set({
        'Content-Type': imageData.contentType || 'image/jpeg',
        'Content-Length': imageData.contentLength?.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Last-Modified': imageData.lastModified?.toUTCString(),
    });

    if (imageData.body) {
        // AWS SDK v3의 스트림을 Node.js Readable 스트림으로 변환
        const stream = imageData.body as Readable;
        stream.pipe(res);
    } else {
        return res.status(500).json({ message: '썸네일 데이터를 읽을 수 없습니다.' });
    }
});