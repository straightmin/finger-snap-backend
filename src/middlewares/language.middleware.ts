import { Request, Response, NextFunction } from 'express';

declare module 'express' {
    interface Request {
        lang?: "ko" | "en" | "ja";
    }
}

export const setLanguage: (req: Request, res: Response, next: NextFunction) => void = (req, res, next) => {
    req.lang = req.headers["accept-language"] === "en" ? "en" : "ko";
    next();
};