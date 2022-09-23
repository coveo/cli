import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {startVerdaccio, shimNpm} from './utils/utils';
import {
  scaffoldDummyPackages,
  publishPackages,
  uplinkMissingPackages,
} from './utils/verdaccio';

async function main() {
  global.processManager = new ProcessManager();
  shimNpm();
  await startVerdaccio();
  await npmLogin();
  scaffoldDummyPackages();
  await publishPackages();
  await uplinkMissingPackages();
  await global.processManager.killAllProcesses();
}

main();
