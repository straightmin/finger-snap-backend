import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// 허용할 파일 MIME 타입 정의
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // 허용
    } else {
        // @ts-ignore
        cb(new Error('지원하지 않는 파일 형식입니다.'), false); // 거부
    }
};

const upload = multer({
    storage: multer.memoryStorage(), // 파일을 메모리에 버퍼로 저장
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
