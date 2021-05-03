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
import stripAnsi from 'strip-ansi';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('ui', () => {
  describe('create:angular', () => {
    let browser: Browser;
    let processManager: ProcessManager;
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '4200';
    // Project name in angular needs first and last character of a word (i.e. words being split by hyphen) to be a letter and not a number.
    const projectName = `a${process.env.GITHUB_ACTION}a-angular-project`;
    const searchPageEndpoint = `http://localhost:${clientPort}`;
    const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;
    let interceptedRequests: HTTPRequest[] = [];
    let page: Page;

    const searchboxSelector = 'app-search-page app-search-box input';

    beforeAll(async () => {
      processManager = new ProcessManager();
      browser = await getNewBrowser();
      const buildProcess = setupUIProject(
        processManager,
        'ui:create:angular',
        projectName,
        {
          flags: ['--defaults'],
        }
      );

      buildProcess.stdout.on('data', async (data) => {
        if (isGenericYesNoPrompt(data.toString())) {
          await answerPrompt(`y${EOL}`, buildProcess);
        }
      });

      await Promise.race([
        new Promise<void>((resolve) => {
          buildProcess.on('exit', async () => {
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          buildProcess.stdout.on('data', (data) => {
            if (
              /Happy hacking !/.test(
                stripAnsi(data.toString()).replace(/\n/g, '')
              )
            ) {
              resolve();
            }
          });
        }),
      ]);

      const terminalServer = new Terminal(
        'npm',
        ['run', 'start'],
        {
          cwd: getProjectPath(projectName),
        },
        processManager
      );

      await terminalServer
        .when(/Compiled successfully/)
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

      expect(await page.$('app-search-page')).not.toBeNull();
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
