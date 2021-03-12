import {spawn} from 'child_process';
import retry from 'async-retry';

import type {Browser} from 'puppeteer';
import type {ChildProcessWithoutNullStreams} from 'child_process';

import {
  answerPrompt,
  CLI_EXEC_PATH,
  isYesNoPrompt,
  killCliProcess,
} from '../utils/cli';
import {connectToChromeBrowser} from '../utils/browser';

describe('auth', () => {
  describe('login', () => {
    let browser: Browser;
    let cliProcess: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
      browser = await connectToChromeBrowser();
    });

    afterEach(async () => {
      await killCliProcess(cliProcess);
    }, 5e3);

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
