import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {startVerdaccio, publishPackages, shimNpm} from './utils';

async function main() {
  global.processManager = new ProcessManager();
  shimNpm();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();
  await global.processManager.killAllProcesses();
}

main();
