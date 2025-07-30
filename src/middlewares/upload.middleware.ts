import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// 허용할 파일 MIME 타입 정의
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * 업로드된 파일의 타입을 검증하는 필터 함수입니다.
 * @param req HTTP 요청 객체
 * @param file 업로드된 파일 객체
 * @param cb 콜백 함수
 */
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // 허용
    } else {
        // @ts-expect-error: Multer의 FileFilterCallback 타입 정의가 Error를 직접 받지 않아 발생. 런타임에는 문제 없음.
        cb(new Error('지원하지 않는 파일 형식입니다.'), false); // 거부
    }
};

const upload = multer({
    storage: multer.memoryStorage(), // 파일을 메모리에 버퍼로 저장
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;
