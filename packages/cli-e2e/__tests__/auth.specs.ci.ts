import retry from 'async-retry';

import type {Browser} from 'puppeteer';

import {answerPrompt, isGenericYesNoPrompt} from '../utils/cli';
import {captureScreenshots, connectToChromeBrowser} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {launch as launchChrome, LaunchedChrome} from 'chrome-launcher';

describe('auth', () => {
  describe('login', () => {
    const {
      ORG_ID: testOrg,
      PLATFORM_ENV: platformEnv,
      PLATFORM_HOST: platformHost,
    } = process.env;
    let browser: Browser;
    let chrome: LaunchedChrome;
    let processManager: ProcessManager;

    beforeAll(async () => {
      chrome = await launchChrome({
        port: 9222,
        userDataDir: false,
        maxConnectionRetries: 240, //equivalent to 2 minutes with the default pollrate of 500ms
        logLevel: 'verbose',
      });

      browser = await connectToChromeBrowser();
      processManager = new ProcessManager();
    }, 5 * 60e3);

    afterAll(() => {
      chrome.kill();
    });

    afterEach(async () => {
      await captureScreenshots(browser);
      await processManager.killAllProcesses();
    }, 5e3);

    it('should open the platform page', async () => {
      const args: string[] = [
        'node',
        process.env.CLI_EXEC_PATH!,
        'auth:login',
        `-e=${platformEnv}`,
        `-o=${testOrg}`,
      ];
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
