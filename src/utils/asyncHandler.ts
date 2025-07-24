import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * 비동기 라우트 핸들러를 감싸서 에러를 자동으로 처리하는 유퓸리티 함수입니다.
 * @param fn 비동기 라우트 핸들러 함수
 * @returns Express RequestHandler
 */
export const asyncHandler = (fn: AsyncFunction): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
