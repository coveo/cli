import type { Request, Response, NextFunction } from "express";

export function environmentCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    import.meta.env.VITE_APP_ORGANIZATION_ID === undefined ||
    import.meta.env.VITE_APP_API_KEY === undefined ||
    import.meta.env.VITE_APP_USER_EMAIL === undefined
  ) {
    const message =
      'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.';
    next({ message });
  } else {
    next();
  }
}
