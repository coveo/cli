require('isomorphic-fetch');
require('abortcontroller-polyfill');

import {Request, Response, NextFunction} from 'express';
import {
  PlatformClient,
  Environment,
  Region,
  RestUserIdType,
  TokenModel,
} from '@coveord/platform-client';

export function ensureTokenGenerated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const platform: PlatformClient =
    req.app.locals.platform ||
    new PlatformClient({
      /**
       * The target environment.
       * The platform.cloud.coveo.com is the default target host.
       * However, you can target a different host by changing the environment.
       *
       * Example:
       * environment: Environment.hipaa will target the HIPAA host (platformhipaa.cloud.coveo.com)
       */
      environment: Environment.prod,
      /**
       * The target region.
       * See https://docs.coveo.com/en/2976/coveo-solutions/deployment-regions-and-strategies#data-residency
       */
      region: Region.US,
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
       */
      userIds: [
        {
          // The security identities to impersonate when authenticating a query with this search token.
          name: process.env.USER_EMAIL!,
          provider: 'Email Security Provider',
          type: RestUserIdType.User,
        },
      ],

      /****** Optional parameters ******/
      /**
       * The name of the search hub to enforce when authenticating a query with this search token.
       * The search hub is a descriptive name of the search interface on which the token is to be used.
       */
      searchHub: 'supporthub',
      /**
       * The filter query expression to apply when authenticating a query with this search token.
       */
      filter: 'NOT @source="my secured source"',
    })
    .then((data: TokenModel) => {
      req.token = data.token;
      next();
    })
    .catch((err) => {
      next(err);
    });

  if (!req.app.locals.platform) {
    req.app.locals.platform = platform;
  }
}
