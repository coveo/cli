import {Engine, HeadlessEngine, searchAppReducers} from '@coveo/headless';

export interface IEngineProp {
  engine: Engine<any>;
}

export async function getSearchToken() {
  const res = await fetch(process.env.REACT_APP_TOKEN_ENDPOINT!);
  const {token} = await res.json();
  return token;
}

export function initializeHeadlessEngine(token: string) {
  return new HeadlessEngine({
    configuration: {
      platformUrl: process.env.REACT_APP_PLATFORM_URL,
      organizationId: process.env.REACT_APP_ORGANIZATION_ID!,
      accessToken: token,
      renewAccessToken: getSearchToken,
    },
    reducers: searchAppReducers,
  });
}
