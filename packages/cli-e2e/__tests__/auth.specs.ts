import retry from 'async-retry';

import type {Browser} from 'puppeteer';

import {answerPrompt, CLI_EXEC_PATH, isYesNoPrompt} from '../utils/cli';
import {captureScreenshots, connectToChromeBrowser} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';

describe.skip('auth', () => {
  describe('login', () => {
    let browser: Browser;
    let processManager: ProcessManager;

    beforeAll(async () => {
      browser = await connectToChromeBrowser();
      processManager = new ProcessManager();
    });

    afterEach(async () => {
      await captureScreenshots(browser);
      await processManager.killAllProcesses();
    }, 5e3);

    it('should open the platform page', async () => {
      // TODO CDX-98: Remove `-e=dev`.
      const cliProcess = processManager.spawn(CLI_EXEC_PATH, [
        'auth:login',
        '-e=dev',
      ]);
      cliProcess.stderr.on('data', async (data) => {
        if (isYesNoPrompt(data.toString())) {
          await answerPrompt('n', cliProcess);
        }
      });
      cliProcess.stdout.on('data', async (data) => {
        if (isYesNoPrompt(data.toString())) {
          await answerPrompt('n', cliProcess);
        }
      });

      await retry(async () => {
        const pages = await browser.pages();
        expect(
          pages.some(
            // TODO CDX-98: URL should vary in fonction of the targeted environment.
            (page) => page.url() === 'https://platformdev.cloud.coveo.com/login'
          )
        ).toBeTruthy();
      });
    }, 30e3);
  });
});
