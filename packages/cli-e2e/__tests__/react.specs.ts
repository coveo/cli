import retry from 'async-retry';

import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {getProjectPath, setupUIProject} from '../utils/cli';
import {isSearchRequest} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('ui', () => {
  describe('create:react', () => {
    let browser: Browser;
    let processManager: ProcessManager;
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '3000';
    const projectName = `${process.env.GITHUB_ACTION}-react-project`;
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let interceptedRequests: HTTPRequest[] = [];
    let page: Page;
    const searchboxSelector = 'div.App .MuiAutocomplete-root input';

    beforeAll(async () => {
      browser = await getNewBrowser();
      processManager = new ProcessManager();
      const buildTerminal = setupUIProject(
        processManager,
        'ui:create:react',
        projectName
      );

      await Promise.race([
        buildTerminal.when('exit').on('process').do().once(),
        buildTerminal
          .when(/Happy hacking !/)
          .on('stdout')
          .do()
          .once(),
      ]);

      const serverTerminal = new Terminal(
        'npm',
        ['run', 'start'],
        {
          cwd: getProjectPath(projectName),
        },
        processManager
      );

      await serverTerminal
        .when(/You can now view .*-react-project in the browser/)
        .on('stdout')
        .do()
        .once();
    }, 15 * 60e3);

    beforeEach(async () => {
      page = await openNewPage(browser, page);
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
      await page.waitForSelector(searchboxSelector);

      expect(await page.$('div.App')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenProxyEndpoint);

      page.goto(searchPageEndpoint);
      await page.waitForSelector(searchboxSelector);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(/^eyJhb.+/),
      });
    });

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchboxSelector);

      expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
    });

    it('should send a search query on searchbox submit', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchboxSelector);

      interceptedRequests = [];

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
