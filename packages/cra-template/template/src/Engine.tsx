import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const headlessEngine = new HeadlessEngine({
  configuration: {
    platformUrl: process.env.REACT_APP_PLATFORM_URL,
    organizationId: process.env.REACT_APP_ORGANIZATION_ID!,
    accessToken: process.env.REACT_APP_API_KEY!,
    renewAccessToken: async () => {
      const res = await fetch('/token');
      const {token} = await res.json();
      return token;
    },
  },
  reducers: searchAppReducers,
});
