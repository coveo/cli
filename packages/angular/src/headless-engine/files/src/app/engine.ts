import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const engine = new HeadlessEngine({
  configuration: {organizationId: '<%= orgId %>', accessToken: '<%= apiKey %>'},
  reducers: searchAppReducers,
});
