import {NextFunction, Request, Response} from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message || 'Something broke!');
}
