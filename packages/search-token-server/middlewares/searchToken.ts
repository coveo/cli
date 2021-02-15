import {NextFunction} from 'express';
import {getSearchToken} from '../utils/cloudPlatformAPI';

export function ensureTokenGenerated(req: any, res: any, next: NextFunction) {
  const userIds = [process.env.USER_EMAIL!].map((user) => ({
    name: user,
    provider: 'Email Security Provider',
  }));

  getSearchToken({
    hostname: process.env.COVEO_PLATFORM_HOSTNAME!,
    apiKey: process.env.COVEO_API_KEY!,
    searchHub: process.env.SEARCH_HUB,
    userIds: userIds,
  })
    .then((data: any) => {
      req.token = data.token;
      next();
    })
    .catch((err: any) => {
      next(err);
    });
}
