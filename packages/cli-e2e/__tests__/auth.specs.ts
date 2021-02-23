import {spawn} from 'child_process';
import {resolve} from 'path';

import retry from 'async-retry';
import axios from 'axios';
import puppeteer from 'puppeteer-core';

import type {Browser} from 'puppeteer-core';
import type {ChildProcessWithoutNullStreams} from 'child_process';

const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
const CHROME_JSON_DEBUG_URL = 'http://localhost:9222/json/version';

describe('auth', () => {
  const getWsUrl = async (): Promise<string> => {
    const chromeDebugInfoRaw = (await axios.get<string>(CHROME_JSON_DEBUG_URL))
      .data;
    return JSON.parse(chromeDebugInfoRaw)['webSocketDebuggerUrl'];
  };

  function isYesNoPrompt(data: string) {
    console.log(data);
    return data.trimEnd().endsWith('(y/n):');
  }

  function answerPrompt(answer: string, proc: ChildProcessWithoutNullStreams) {
    return new Promise<void>((resolve) => {
      if (!proc.stdin.write(answer)) {
        proc.stdin.once('drain', () => resolve());
      } else {
        process.nextTick(() => resolve);
      }
    });
  }

  describe('login', () => {
    let browser: Browser;
    let cliProcess: ChildProcessWithoutNullStreams;
    let wsURL: string;

    beforeAll(async () => {
      wsURL = await getWsUrl();
    });

    beforeAll(async () => {
      //todo switch to beforeall.
      browser = await puppeteer.connect({browserWSEndpoint: wsURL});
    });

    afterEach(async () => {
      console.log('hello');
      const waitForKill = new Promise<void>((resolve) => {
        cliProcess.on('close', () => resolve());
      });
      cliProcess.kill('SIGINT');
      const pages = await browser.pages();
      const pageClosePromises: Promise<void>[] = [];
      for (const page of pages) {
        pageClosePromises.push(page.close());
      }
      await Promise.all([waitForKill, ...pageClosePromises]);
    }, 5e3);

    afterAll(async () => {
      await browser.close();
    });

    it('should open the platform page', async () => {
      cliProcess = spawn(CLI_EXEC_PATH, ['auth:login']);
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
            (page) => page.url() === 'https://platform.cloud.coveo.com/login'
          )
        ).toBeTruthy();
      });
    }, 30e3);
  });
});
