import {spawn} from 'child_process';

import type {Browser} from 'puppeteer-core';
import type {ChildProcessWithoutNullStreams} from 'child_process';

import {CLI_EXEC_PATH, killCliProcess} from '../utils/cli';
import {closeAllPages, getBrowser} from '../utils/browser';
import axios from 'axios';

declare const document: any;

describe('ui', () => {
  describe('create:vue', () => {
    let browser: Browser;
    let cliProcess: ChildProcessWithoutNullStreams;
    const clientPort = '8080'; // TODO: find port dynamically
    const projectName = 'my-project';
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;

    beforeAll(async () => {
      browser = await getBrowser();
      // TODO: build the project
      // TODO: Run the dev server
      // cliProcess = spawn(CLI_EXEC_PATH, ['ui:create:vue', projectName]);
      // return new Promise<void>((resolve) => {
      //   getBrowser().then((b) => (browser = b));
      //   cliProcess = spawn('npm', ['run', 'start'], {
      //     // cliProcess = spawn('ls', ['-al'], {
      //     cwd: projectName,
      //   });
      //   setTimeout(() => {
      //     resolve();
      //   }, 15e1);
      // });
      // setTimeout(() => {
      //   done();
      // }, 2000);
    });

    afterAll(async () => {
      // await killCliProcess(cliProcess);
      await browser.close();
    });

    afterEach(async () => {
      const pageClosePromises = await closeAllPages(browser);
      await Promise.all(pageClosePromises);
    }, 5e3);

    // it('should get a search token', async () => {
    //   const response = await axios.get(`http://localhost:4000/token`);
    //   expect(response.data).toMatchObject({
    //     token: expect.stringMatching(/.+/),
    //   });
    // });

    it('should contain a hero section', async () => {
      const page = await browser.newPage();
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });
      const aHandle = await page.evaluateHandle(() =>
        // TODO: declare document
        document.querySelector('.hero h1')
      );

      const resultHandle = await page.evaluateHandle(
        (element) => element.innerHTML,
        aHandle
      );

      expect(await resultHandle.jsonValue()).toEqual(
        'Welcome to Your Coveo Vue.js Search Page'
      );
    });

    it('should contain a search page section', async () => {
      const page = await browser.newPage();
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$('#search-page')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      const page = await browser.newPage();
      page.goto(searchPageEndpoint);
      const tokenResponse = await page.waitForResponse(tokenProxyEndpoint);
      expect(JSON.parse(await tokenResponse.text())).toMatchObject({
        token: expect.stringMatching(/.+/),
      });
    });

    it('should trigger search queries', async () => {
      const page = await browser.newPage();
      const searchboxSelector = '#search-page .autocomplete input';
      let isInterfaceLoadSearch = true;

      page.on('request', (request) => {
        if (
          request.method() === 'POST' &&
          request.url().indexOf(
            // TODO: Test with Prod environment
            'https://platformdev.cloud.coveo.com/rest/search/v2?organizationId'
          ) === 0
        ) {
          const data = JSON.parse(request.postData());
          if (!isInterfaceLoadSearch) {
            expect(data).toMatchObject({
              q: 'my query',
            });
          }
          isInterfaceLoadSearch = false;
        }
      });

      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchboxSelector);
      await page.focus(searchboxSelector);
      await page.keyboard.type('my query');
      await page.keyboard.press('Enter');
    });
  });

  it.todo('should create a Vue.js project with a custom preset');
  it.todo('should redirect the user to an error page if invalid env file');
});
