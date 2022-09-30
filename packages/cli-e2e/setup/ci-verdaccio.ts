import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {startVerdaccio, shimNpm} from './utils/utils';
import {scaffoldDummyPackages, publishPackages} from './utils/verdaccio';

async function main() {
  global.processManager = new ProcessManager();
  shimNpm();
  await startVerdaccio();
  await npmLogin();
  await scaffoldDummyPackages();
  await publishPackages();
  await global.processManager.killAllProcesses();
}

main();
