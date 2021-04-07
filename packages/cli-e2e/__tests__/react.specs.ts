import retry from 'async-retry';

import type {HTTPRequest, Browser, Page} from 'puppeteer';
import stripAnsi from 'strip-ansi';

import {captureScreenshots, getNewBrowser} from '../utils/browser';
import {getProjectPath, setupUIProject} from '../utils/cli';
import {isSearchRequest} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';

describe('ui', () => {
  describe('create:react', () => {
    let browser: Browser;
    let processManager: ProcessManager;
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '3000';
    const projectName = 'react-project';
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let interceptedRequests: HTTPRequest[] = [];
    let page: Page;
    const openNewPage = async () => {
      const newPage = await browser.newPage();
      if (page) {
        await page.close();
      }
      return newPage;
    };

    beforeAll(async () => {
      browser = await getNewBrowser();
      processManager = new ProcessManager();
      const buildProcess = setupUIProject(
        processManager,
        'ui:create:react',
        projectName
      );

      await new Promise<void>((resolve) => {
        buildProcess.on('exit', async () => {
          resolve();
        });
      });

      const startServerProcess = processManager.spawn('npm', ['run', 'start'], {
        cwd: getProjectPath(projectName),
      });
      await new Promise<void>((resolve) => {
        startServerProcess.stdout.on('data', async (data) => {
          if (
            /You can now view react-project in the browser/.test(
              stripAnsi(data.toString()).replace(/\n/g, '')
            )
          ) {
            resolve();
          }
        });
      });
    }, 15 * 60e3);

    beforeEach(async () => {
      page = await openNewPage();

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      await captureScreenshots(browser);
      page.removeAllListeners('request');
      interceptedRequests = [];
    });

    afterAll(async () => {
      await browser.close();
      await processManager.killAllProcesses();
    }, 5e3);

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$('div.App')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      page.goto(searchPageEndpoint);
      const tokenResponse = await page.waitForResponse(tokenProxyEndpoint);
      expect(JSON.parse(await tokenResponse.text())).toMatchObject({
        token: expect.stringMatching(/^eyJhb.+/),
      });
    });

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
    });

    it('should send a search query on searchbox submit', async () => {
      const searchboxSelector = 'div.App .MuiAutocomplete-root input';
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});

      interceptedRequests = [];

      await page.waitForSelector(searchboxSelector);
      await page.focus(searchboxSelector);
      await page.keyboard.type('my query');
      await page.keyboard.press('Enter');

      await retry(async () => {
        expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
      });
    });
  });

  it.todo('should redirect the user to an error page if invalid env file');
});
