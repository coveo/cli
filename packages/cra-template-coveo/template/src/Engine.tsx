import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

export const headlessEngine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
});
