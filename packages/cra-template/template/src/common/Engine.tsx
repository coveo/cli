import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export async function getSearchToken() {
  const res = await fetch(process.env.REACT_APP_TOKEN_ENDPOINT!);
  const {token} = await res.json();
  return token;
}

export async function initializeHeadlessEngine() {
  return new HeadlessEngine({
    configuration: {
      platformUrl: process.env.REACT_APP_PLATFORM_URL,
      organizationId: process.env.REACT_APP_ORGANIZATION_ID!,
      accessToken: await getSearchToken(),
      renewAccessToken: getSearchToken,
    },
    reducers: searchAppReducers,
  });
}
