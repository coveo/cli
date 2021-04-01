import retry from 'async-retry';
import {mkdirSync, writeFileSync} from 'fs';
import {join} from 'path';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {
  answerPrompt,
  getProjectPath,
  isGenericYesNoPrompt,
  setupUIProject,
  teardownUIProject,
} from '../utils/cli';
import {captureScreenshots, getNewBrowser} from '../utils/browser';
import {isSearchRequest} from '../utils/platform';
import stripAnsi from 'strip-ansi';
import {EOL} from 'os';

describe('ui', () => {
  describe('create:vue', () => {
    let browser: Browser;
    const cliProcesses: ChildProcessWithoutNullStreams[] = [];
    // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
    const clientPort = '8080';
    const projectName = 'vue-project';
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
      const projectPath = getProjectPath(projectName);
      mkdirSync(projectPath, {recursive: true});
      writeFileSync(
        join(projectPath, '.yarnrc'),
        'registry "http://verdaccio:4873"'
      );
      const buildProcess = setupUIProject('ui:create:vue', projectName);
      cliProcesses.push(buildProcess);

      buildProcess.stdout.on('data', async (data) => {
        if (
          /Pick an action: \(Use arrow keys\)/.test(stripAnsi(data.toString()))
        ) {
          await answerPrompt('\u001b[B', buildProcess);
          return;
        }
        if (/❯ Merge/.test(stripAnsi(data.toString()))) {
          await answerPrompt(EOL, buildProcess);
          return;
        }
        if (isGenericYesNoPrompt(data.toString())) {
          await answerPrompt(`y${EOL}`, buildProcess);
          return;
        }
      });

      await new Promise<void>((resolve) => {
        buildProcess.stdout.on('close', async () => {
          resolve();
        });
      });

      const startServerProcess = spawn('npm', ['run', 'start'], {
        cwd: projectPath,
        detached: true,
      });

      cliProcesses.push(startServerProcess);
      await new Promise<void>((resolve) => {
        startServerProcess.stdout.on('data', async (data) => {
          if (stripAnsi(data.toString()).indexOf('App running at:') !== -1) {
            resolve();
          }
        });
      });
    }, 420e3);

    beforeEach(async () => {
      page = await openNewPage();

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      await captureScreenshots(browser);
    });

    afterAll(async () => {
      await browser.close();
      await teardownUIProject(cliProcesses);
    }, 5e3);

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$('#search-page')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      page.goto(searchPageEndpoint);
      const tokenResponse = await page.waitForResponse(tokenProxyEndpoint);
      expect(JSON.parse(await tokenResponse.text())).toMatchObject({
        token: expect.stringMatching(/^eyJhb.+/),
      });
    });

    it('should trigger search queries', async () => {
      const searchboxSelector = '#search-page .autocomplete input';
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

  it.todo('should create a Vue.js project with a custom preset');
  it.todo('should redirect the user to an error page if invalid env file');
});
