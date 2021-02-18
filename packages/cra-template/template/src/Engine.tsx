import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const headlessEngine = new HeadlessEngine({
  configuration: {
    platformUrl: process.env.REACT_APP_PLATFORM_URL,
    organizationId: process.env.REACT_APP_ORGANIZATION_ID!,
    accessToken: process.env.REACT_APP_API_KEY!,
    renewAccessToken: () =>
      window
        .fetch('/token')
        .then((data) => data.json())
        .then((data) => data.token),
  },
  reducers: searchAppReducers,
});
