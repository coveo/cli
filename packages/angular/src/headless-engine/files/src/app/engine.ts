import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const engine = new HeadlessEngine({
  //  TODO: Connect to the user's org (CDX-73)
  // API Key has to come from an .env file (or any other file that is part of the .gitignore)
  configuration: {
    platformUrl: '<=% platformUrl %>',
    organizationId: '<%= orgId %>',
    accessToken: '<%= apiKey %>',
    renewAccessToken: () =>
      window
        .fetch('/token')
        .then((data) => data.json())
        .then((data) => data.token),
  },
  reducers: searchAppReducers,
});
