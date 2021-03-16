import retry from 'async-retry';

import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {setupUIProject, teardownUIProject} from '../utils/cli';
import {getNewBrowser} from '../utils/browser';
import {isSearchRequest} from '../utils/platform';

describe('ui', () => {
  describe('create:angular', () => {
    let browser: Browser;
    const cliProcesses: ChildProcessWithoutNullStreams[] = [];
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '4200';
    const projectName = 'angular-project';
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let interceptedRequests: HTTPRequest[] = [];
    let page: Page;

    beforeAll(async () => {
      browser = await getNewBrowser();
      await setupUIProject(
        ['ui:create:angular', '--defaults'],
        projectName,
        cliProcesses
      );
    }, 3e6);

    beforeEach(async () => {
      page = await browser.newPage();

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterAll(async () => {
      await browser.close();
      await teardownUIProject(cliProcesses);
    }, 5e3);

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$('app-search-page')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      page.goto(searchPageEndpoint);
      const tokenResponse = await page.waitForResponse(tokenProxyEndpoint);
      expect(JSON.parse(await tokenResponse.text())).toMatchObject({
        token: expect.stringMatching(/^eyJhb.+/),
      });
    });

    it('should trigger search queries', async () => {
      const searchboxSelector = 'app-search-page app-search-box input';
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});

      // Request from interface load
      expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
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
