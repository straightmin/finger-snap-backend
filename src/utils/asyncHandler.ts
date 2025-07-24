import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const asyncHandler = (fn: AsyncFunction): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
