import {spawn} from 'child_process';

import type {Browser} from 'puppeteer-core';
import type {ChildProcessWithoutNullStreams} from 'child_process';

import {CLI_EXEC_PATH, killCliProcess} from '../utils/cli';
import {closeAllPages, getBrowser} from '../utils/browser';
import axios from 'axios';

describe('ui', () => {
  describe('create:vue', () => {
    let browser: Browser;
    let cliProcess: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
      browser = await getBrowser();
      // TODO: login()
    });

    afterEach(async () => {
      const killCliPromise = killCliProcess(cliProcess);
      const pageClosePromises = await closeAllPages(browser);
      await Promise.all([killCliPromise, ...pageClosePromises]);
    }, 5e3);

    afterAll(async () => {
      await browser.close();
    });

    describe('App with default parameters', () => {
      // TODO: find port dynamically
      const clientPort = '8080';
      const serverPort = '4000';
      const projectName = 'my-project';

      beforeAll(() => {
        // TODO: need new release of @coveo/vue-cli-plugin-typescript otherwise it wont work
        // cliProcess = spawn(CLI_EXEC_PATH, ['ui:create:vue', projectName]);
        cliProcess = spawn('npm', ['run', 'start'], {
          cwd: projectName,
        });
        jest.setTimeout(10e3);
      });

      it('should return a search search token', async () => {
        const response = await axios.get(
          `http://localhost:${serverPort}/token`
        );
        expect(response.data).toMatchObject({
          token: expect.stringMatching(/.+/),
        });
      }, 30e3);

      it('should open a working search page', async () => {
        const page1 = await browser.newPage();
        await page1.goto(`http://localhost:${clientPort}`);
        // TODO: make sure the page loads correctly
        // TODO: make sure we are able to query the Search API
      }, 30e3);
    });

    it.todo('should create a Vue.js project with a custom preset');
    it.todo('should create a Vue.js project with an invalid environment file');
    // It should redirect the user to an error page
  });
});
