import { Request, Response, NextFunction } from 'express';

declare module 'express' {
    interface Request {
        lang?: "ko" | "en" | "ja";
    }
}

export const setLanguage: (req: Request, res: Response, next: NextFunction) => void = (req, res, next) => {
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