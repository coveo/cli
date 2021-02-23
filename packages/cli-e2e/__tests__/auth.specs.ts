import {spawn} from 'child_process';
import retry from 'async-retry';

import type {Browser} from 'puppeteer-core';
import type {ChildProcessWithoutNullStreams} from 'child_process';

import {
  answerPrompt,
  CLI_EXEC_PATH,
  isYesNoPrompt,
  killCliProcess,
} from '../utils/cli';
import {closeAllPages, getBrowser} from '../utils/browser';

describe('auth', () => {
  describe('login', () => {
    let browser: Browser;
    let cliProcess: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
      browser = await getBrowser();
    });

    afterEach(async () => {
      const killCliPromise = killCliProcess(cliProcess);
      const pageClosePromises = await closeAllPages(browser);
      await Promise.all([killCliPromise, ...pageClosePromises]);
    }, 5e3);

    afterAll(async () => {
      await browser.close();
    });

    it('should open the platform page', async () => {
      // TODO CDX-98: Remove `-e=dev`.
      cliProcess = spawn(CLI_EXEC_PATH, ['auth:login', '-e=dev']);
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
        pages.forEach((page) => {
          console.log(page.url());
        });
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
