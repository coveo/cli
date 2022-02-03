import retry from 'async-retry';

import type {Browser} from 'puppeteer';

import {answerPrompt, CLI_EXEC_PATH, isGenericYesNoPrompt} from '../utils/cli';
import {captureScreenshots, connectToChromeBrowser} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('auth', () => {
  describe('login', () => {
    const {
      ORG_ID: testOrg,
      PLATFORM_ENV: platformEnv,
      PLATFORM_HOST: platformHost,
    } = process.env;
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
      const args: string[] = [
        CLI_EXEC_PATH,
        'auth:login',
        `-e=${platformEnv}`,
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
        const loginUrl = new URL('/login', platformHost);
        expect(pages.some((page) => page.url() === loginUrl.href)).toBeTruthy();
      });
    }, 30e3);
  });
});
