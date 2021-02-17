import {Request, Response, NextFunction} from 'express';

export function environmentCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    process.env.ORGANIZATION_ID === undefined ||
    process.env.API_KEY === undefined ||
    process.env.USER_EMAIL === undefined
  ) {
    const message =
      'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.';
    next({message});
  } else {
    next();
  }
}
