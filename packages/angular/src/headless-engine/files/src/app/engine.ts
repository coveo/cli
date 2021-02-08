import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const engine = new HeadlessEngine({
  // configuration: {organizationId: '<%= orgId %>', accessToken: '<%= apiKey %>'},
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
});
