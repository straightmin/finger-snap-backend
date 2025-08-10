import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
}

/**
 * 전역 에러 처리 미들웨어입니다.
 * @param err 발생한 에러 객체
 * @param req HTTP 요청 객체
 * @param res HTTP 응답 객체
 * @param _next 다음 미들웨어 함수 (사용되지 않음)
 */
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
