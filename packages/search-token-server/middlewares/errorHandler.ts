import type {NextFunction, Request, Response} from 'express';

interface HTTPError extends Error {
  statusCode: number;
}

export function errorHandler(
  err: HTTPError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message || 'Something broke!');
}
