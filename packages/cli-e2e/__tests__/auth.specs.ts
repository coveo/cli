import retry from 'async-retry';

import type {Browser} from 'puppeteer';

import {answerPrompt, CLI_EXEC_PATH, isGenericYesNoPrompt} from '../utils/cli';
import {captureScreenshots, connectToChromeBrowser} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('auth', () => {
  describe('login', () => {
    const testOrg = process.env.ORG_ID;
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
      const args: string[] = [
        CLI_EXEC_PATH,
        'auth:login',
        '-e=dev',
        `-o=${testOrg}`,
      ];
      if (process.platform === 'win32') {
        args.unshift('node');
      }
      await captureScreenshots(browser);
      const cliTerminal = new Terminal(
        args.shift()!,
        args,
        undefined,
        processManager,
        'auth-login'
      );

      cliTerminal
        .when(isGenericYesNoPrompt)
        .on('stderr')
        .do(answerPrompt('n'))
        .once();

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
