import 'dotenv/config';

import {mkdirSync, statSync} from 'fs';
import {launch as launchChrome} from 'chrome-launcher';
import {connectToChromeBrowser, SCREENSHOTS_PATH} from './utils/browser';
import {loginWithOffice} from './utils/login';
import {getPlatformHost} from './utils/platform';
import waitOn from 'wait-on';
import {ProcessManager} from './utils/processManager';
import {restoreCliConfig} from './setup/utils';
import {Terminal} from './utils/terminal/terminal';
import {answerPrompt} from './utils/cli';
const hasPreviousConfigFile = statSync('decrypted', {throwIfNoEntry: false});
(async () => {
  if (hasPreviousConfigFile) {
    restoreCliConfig();
    return;
  }
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  global.processManager = new ProcessManager();
  const recordingTerminal = new Terminal(
    'ffmpeg',
    ['-f', 'x11grab', '-i', ':1', './packages/cli-e2e/artifacts/test.mp4'],
    undefined,
    global.processManager!,
    'ffmpeg-record'
  );
  process.env.PLATFORM_ENV = process.env.PLATFORM_ENV?.toLowerCase() || '';
  process.env.PLATFORM_HOST = getPlatformHost(process.env.PLATFORM_ENV);
  const chrome = await launchChrome({port: 9222, userDataDir: false});
  await waitOn({resources: ['tcp:9222']});
  const browser = await connectToChromeBrowser();
  await recordingTerminal
    .when(
      (async () => {
        await loginWithOffice(browser);
      })()
    )
    .on('process')
    .do(answerPrompt('q\n'))
    .once();

  await chrome.kill();
  await global.processManager.killAllProcesses();
})();
