import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
});

export default engine;
