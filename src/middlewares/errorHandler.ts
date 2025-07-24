import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err.stack); // 서버 콘솔에 에러 스택 출력

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};
