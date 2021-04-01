import retry from 'async-retry';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {
  answerPrompt,
  getProjectPath,
  isGenericYesNoPrompt,
  setupUIProject,
  teardownUIProject,
} from '../utils/cli';
import {getNewBrowser} from '../utils/browser';
import {isSearchRequest} from '../utils/platform';
import {EOL} from 'os';
import stripAnsi from 'strip-ansi';

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

    // TODO: Refactor.
    const openNewPage = async () => {
      const newPage = await browser.newPage();
      if (page) {
        await page.close();
      }
      return newPage;
    };

    beforeAll(async () => {
      browser = await getNewBrowser();
      const buildProcess = await setupUIProject(
        'ui:create:angular',
        projectName,
        {
          flags: ['--defaults'],
        }
      );
      buildProcess.stdout.on('data', async (data) => {
        process.stdout.write(data.toString());
        if (isGenericYesNoPrompt(data.toString())) {
          await answerPrompt(`y${EOL}`, buildProcess);
        }
      });
      buildProcess.stderr.on('data', async (data) => {
        process.stdout.write(data.toString());
      });
      process.stdout.write('almost ready');
      await new Promise<void>((resolve) => {
        buildProcess.stdout.on('close', async () => {
          resolve();
        });
      });
      process.stdout.write('ready!');

      const startServerProcess = spawn('npm', ['run', 'start'], {
        cwd: getProjectPath(projectName),
        detached: true,
      });
      cliProcesses.push(startServerProcess);

      await new Promise<void>((resolve) => {
        startServerProcess.stdout.on('data', async (data) => {
          process.stdout.write(data.toString());
          if (/Compiled successfully/.test(stripAnsi(data.toString()))) {
            resolve();
          }
        });
      });
    }, 3e6);

    beforeEach(async () => {
      page = await openNewPage();

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      page.removeAllListeners('request');
      interceptedRequests = [];
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
    }, 300e3);

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenProxyEndpoint);

      page.goto(searchPageEndpoint);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(/^eyJhb.+/),
      });
    });

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
    });

    it('should send a search query on searchbox submit', async () => {
      const searchboxSelector = 'app-search-page app-search-box input';
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
