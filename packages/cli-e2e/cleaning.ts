import 'dotenv/config';

import {mkdirSync, statSync} from 'fs';
import {launch as launchChrome} from 'chrome-launcher';
import {connectToChromeBrowser, SCREENSHOTS_PATH} from './utils/browser';
import {loginWithOffice} from './utils/login';
import {getPlatformHost} from './utils/platform';
import waitOn from 'wait-on';
import {ProcessManager} from './utils/processManager';
import {restoreCliConfig, setCliExecPath} from './setup/utils';
(async () => {
  if (statSync('decrypted', {throwIfNoEntry: false})) {
    restoreCliConfig();
  } else {
    setCliExecPath();
    mkdirSync(SCREENSHOTS_PATH, {recursive: true});
    global.processManager = new ProcessManager();
    process.env.PLATFORM_ENV = process.env.PLATFORM_ENV?.toLowerCase() || '';
    process.env.PLATFORM_HOST = getPlatformHost(process.env.PLATFORM_ENV);
    const chrome = await launchChrome({port: 9222, userDataDir: false});
    await waitOn({resources: ['tcp:9222']});
    const browser = await connectToChromeBrowser();
    await loginWithOffice(browser);
    await chrome.kill();
    await global.processManager.killAllProcesses();
  }
})();
