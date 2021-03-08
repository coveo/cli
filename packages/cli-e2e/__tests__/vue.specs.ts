import {spawn, spawnSync} from 'child_process';

import type {ChildProcessWithoutNullStreams} from 'child_process';

import {CLI_EXEC_PATH, killCliProcessFamily} from '../utils/cli';
import {closeAllPages, getBrowser} from '../utils/browser';
import {Browser} from 'puppeteer-core';
import {loginWithOffice} from '../utils/login';

// TODO: find a better way
declare const document: any;

describe('ui', () => {
  describe('create:vue', () => {
    let browser: Browser;
    const cliProcesses: ChildProcessWithoutNullStreams[] = [];
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '8080';
    const projectName = 'vue-project';
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let waitForProjectToStartTimeout: NodeJS.Timeout;

    beforeAll(async () => {
      browser = await getBrowser();

      await loginWithOffice(browser, cliProcesses);

      const buildProcess = spawnSync(
        CLI_EXEC_PATH,
        // TODO: CDX-141: Add a --default flag to prevent prompts
        ['ui:create:vue', projectName]
      );

      expect(buildProcess.status).toEqual(0);

      const waitForProjectToStart = new Promise<void>((resolve) => {
        const startServerProcess = spawn('npm', ['run', 'start'], {
          cwd: projectName,
          detached: true,
        });

        cliProcesses.push(startServerProcess);

        waitForProjectToStartTimeout = setTimeout(() => {
          resolve();
        }, 15e3);
      });

      return waitForProjectToStart;
    }, 240e3);

    afterAll(async () => {
      clearTimeout(waitForProjectToStartTimeout);
      await browser.close();
      return Promise.all(
        cliProcesses.map((cliProcess) => killCliProcessFamily(cliProcess))
      );
    }, 5e3);

    afterEach(async () => {
      const pageClosePromises = await closeAllPages(browser);
      return Promise.all(pageClosePromises);
    }, 5e3);

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
