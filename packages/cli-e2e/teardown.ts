import {connectToChromeBrowser} from './utils/browser';
import {deleteAllCliApiKeys} from './utils/cli';
import {killZombieProcesses} from './utils/windowsProcessKiller';

export default async function () {
  console.log('Teardown: Closing browser');
  const browser = await connectToChromeBrowser();
  await browser.close();
  console.log('Teardown: Cleaning API Keys');
  await deleteAllCliApiKeys();
  if (global.processManager) {
    console.log('Teardown: Killing all registered processes');
    await global.processManager.killAllProcesses();
  }
  console.log('Teardown: Killing zombie processes');
  if (process.platform === 'win32') {
    killZombieProcesses();
  }
}
