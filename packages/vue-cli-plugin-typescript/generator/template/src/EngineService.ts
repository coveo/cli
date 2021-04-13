import {HeadlessEngine, searchAppReducers} from '@coveo/headless';
import {isEnvValid} from './utils/envUtils';

export function getEngine(
  token: string
): HeadlessEngine<typeof searchAppReducers> {
  if (!isEnvValid(process.env)) {
    throw new Error(`
    You should have a valid <code>.env</code> file at the root of this \
    project. You can use <code>.env.example</code> as starting point and \
    make sure to replace all placeholder variables by the proper information \
    for your organization.

    Refer to the project README file for more information.
    `);
  } else {
    const tokenEndpoint = process.env.VUE_APP_TOKEN_ENDPOINT;
    return new HeadlessEngine({
      configuration: {
        platformUrl: process.env.VUE_APP_PLATFORM_URL,
        organizationId: process.env.VUE_APP_ORGANIZATION_ID,
        accessToken: token,
        renewAccessToken: async () => {
          const res = await fetch(tokenEndpoint);
          const {token} = await res.json();
          return token;
        },
      },
      reducers: searchAppReducers,
    });
  }
}
