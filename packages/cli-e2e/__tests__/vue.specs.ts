import retry from 'async-retry';
import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {
  answerPrompt,
  getProjectPath,
  isGenericYesNoPrompt,
  setupUIProject,
} from '../utils/cli';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {isSearchRequest} from '../utils/platform';
import {EOL} from 'os';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('ui', () => {
  describe('create:vue', () => {
    let browser: Browser;
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '8080';
    const projectName = `${process.env.GITHUB_ACTION}-vue-project`;
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let interceptedRequests: HTTPRequest[] = [];
    let page: Page;
    let processManager: ProcessManager;
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      processManager = new ProcessManager();
      browser = await getNewBrowser();

      const buildTerminal = setupUIProject(
        processManager,
        'ui:create:vue',
        projectName
      );

      const buildTerminalExitPromise = Promise.race([
        buildTerminal.when('exit').on('process').do().once(),
        buildTerminal
          .when(/Happy hacking !/)
          .on('stdout')
          .do()
          .once(),
      ]);

      buildTerminal
        .when(isGenericYesNoPrompt)
        .on('stdout')
        .do(answerPrompt(`y${EOL}`))
        .until(buildTerminalExitPromise);

      await buildTerminalExitPromise;

      const serverTerminal = new Terminal(
        'npm',
        ['run', 'start'],
        {
          cwd: getProjectPath(projectName),
        },
        processManager,
        'vue-server'
      );

      await serverTerminal
        .when(/App running at:/)
        .on('stdout')
        .do()
        .once();
    }, 420e3);

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

      expect(await page.$('#search-page')).not.toBeNull();
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

  it.todo('should create a Vue.js project with a custom preset');
  it.todo('should redirect the user to an error page if invalid env file');
});
