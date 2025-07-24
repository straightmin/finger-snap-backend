import { Request, Response, NextFunction } from 'express';

declare module 'express' {
    interface Request {
        lang?: "ko" | "en" | "ja";
    }
}

/**
 * Accept-Language 헤더를 기반으로 언어를 설정하는 미들웨어입니다.
 * @param req HTTP 요청 객체
 * @param res HTTP 응답 객체
 * @param next 다음 미들웨어로 제어를 전달하는 함수
 */
export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
    const acceptLanguage = req.headers["accept-language"];
    if (acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
        if (languages.includes('ko')) {
            req.lang = 'ko';
        } else if (languages.includes('en')) {
            req.lang = 'en';
        } else if (languages.includes('ja')) {
            req.lang = 'ja';
        } else {
            req.lang = 'ko'; // 기본값
        }
    } else {
        req.lang = 'ko'; // Accept-Language 헤더가 없는 경우 기본값
    }
    next();
};