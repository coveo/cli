require('isomorphic-fetch');
require('abortcontroller-polyfill');

import {Request, Response, NextFunction} from 'express';
import {
  PlatformClient,
  RestUserIdType,
  TokenModel,
} from '@coveo/platform-client';

export function ensureTokenGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const platform: PlatformClient =
    req.app.locals.platform ||
    new PlatformClient({
      /**
       * The Plaform URL to use.
       * https://platform.cloud.coveo.com is the default platform host.
       * However, you can target a different environment by changing the host value.
       *
       * Example:
       * Use "https://platformhipaa.cloud.coveo.com" if you want to target the HIPAA environment.
       *
       * You can also target a different region (e.g. https://platform-au.cloud.coveo.com)
       * See https://docs.coveo.com/en/2976/coveo-solutions/deployment-regions-and-strategies#data-residency
       */
      host: process.env.PLATFORM_URL,
      /**
       * The unique identifier of your Coveo organization.
       * To retrieve your org ID, see https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id
       */
      organizationId: process.env.ORGANIZATION_ID,
      /**
       * An API key with the impersonate privilege in the target organization.
       * See https://docs.coveo.com/en/1718/manage-an-organization/manage-api-keys#add-an-api-key
       */
      accessToken: process.env.API_KEY!,
    });

  platform.search
    .createToken({
      /****** Mandatory parameters ******/
      /**
       * The security identities to impersonate when authenticating a query with this search token.
       * The userIds array should contain at least one security indentity.
       * See https://docs.coveo.com/en/56/#userids-array-of-restuserid-required
       */
      userIds: [
        {
          name: process.env.USER_EMAIL!,
          provider: 'Email Security Provider',
          type: RestUserIdType.User,
        },
      ],

      /****** Optional parameters ******/
      /**
       * The name of the search hub to enforce when authenticating a query with this search token.
       * The search hub is a descriptive name of the search interface on which the token is to be used.
       *See https://docs.coveo.com/en/56/#searchhub-string-optional

       * Example:
       * searchHub: 'supporthub',
       */

      /**
       * The filter query expression to apply when authenticating a query with this search token.
       * See https://docs.coveo.com/en/56/#filter-string-optional
       *
       * Example:
       * filter: 'NOT @source="my secured source"',
       */
    })
    .then((data: TokenModel) => {
      req.body.token = data.token;
      next();
    })
    .catch((err) => {
      next(err);
    });

  if (!req.app.locals.platform) {
    req.app.locals.platform = platform;
  }
}
