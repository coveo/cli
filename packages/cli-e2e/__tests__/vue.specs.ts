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
import {deactivateEnvironmentFile, restoreEnvironmentFile} from '../utils/file';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {commitProject, undoCommit} from '../utils/misc';

describe('ui:create:vue', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const projectName = `${process.env.GITHUB_ACTION}-vue-project`;
  // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
  const clientPort = '8080';
  const searchPageEndpoint = `http://localhost:${clientPort}`;
  const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;

  const buildApplication = async (processManager: ProcessManager) => {
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

    await buildTerminal
      .when(isGenericYesNoPrompt)
      .on('stdout')
      .do(answerPrompt(`y${EOL}`))
      .until(buildTerminalExitPromise);

    await buildTerminalExitPromise;
  };

  const startApplication = async (processManager: ProcessManager) => {
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
  };

  beforeAll(async () => {
    const buildProcessManager = new ProcessManager();
    processManagers.push(buildProcessManager);
    browser = await getNewBrowser();
    await buildApplication(buildProcessManager);
    await buildProcessManager.killAllProcesses();
  }, 15 * 60e3);

  beforeEach(async () => {
    jest.resetModules();
    process.env = {...oldEnv};
    page = await openNewPage(browser, page);
  });

  afterEach(async () => {
    await captureScreenshots(browser);
  });

  afterAll(async () => {
    process.env = oldEnv;
    await browser.close();
    await Promise.all(
      processManagers.map((manager) => manager.killAllProcesses())
    );
  });

  describe('when the project is configured correctly', () => {
    let serverProcessManager: ProcessManager;
    let interceptedRequests: HTTPRequest[] = [];
    let consoleInterceptor: BrowserConsoleInterceptor;
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      await startApplication(serverProcessManager);
    }, 2 * 60e3);

    beforeEach(async () => {
      consoleInterceptor = new BrowserConsoleInterceptor(page, projectName);
      await consoleInterceptor.startSession();

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      page.removeAllListeners('request');
      interceptedRequests = [];
      await consoleInterceptor.endSession();
    });

    afterAll(async () => {
      await undoCommit(
        serverProcessManager,
        getProjectPath(projectName),
        projectName
      );
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it('should not contain console errors nor warnings', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(consoleInterceptor.interceptedMessages).toEqual([]);
    });

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

    it('should be commited without lint-stage errors', async () => {
      const eslintErrorSpy = jest.fn();

      commitProject(
        serverProcessManager,
        getProjectPath(projectName),
        projectName,
        eslintErrorSpy
      );

      expect(eslintErrorSpy).not.toBeCalled();
    }, 10e3);
  });

  describe('when starting the server', () => {
    let serverProcessManager: ProcessManager;

    beforeEach(() => {
      serverProcessManager = new ProcessManager();
    });

    afterEach(async () => {
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it(
      'should not have any ESLint warning or error',
      async () => {
        const serverTerminal = new Terminal(
          'npm',
          ['run', 'start'],
          {
            cwd: getProjectPath(projectName),
          },
          serverProcessManager,
          'vue-server'
        );
        const eslintErrorSpy = jest.fn();
        const serverExitCondition = serverTerminal
          .when(/App running at:/)
          .on('stdout')
          .do()
          .once();

        await serverTerminal
          .when(/✖ \d+ problems \(\d+ errors, \d+ warnings\)/)
          .on('stdout')
          .do(eslintErrorSpy)
          .until(serverExitCondition);

        expect(eslintErrorSpy).not.toBeCalled();
      },
      5 * 60e3
    );
  });

  describe('when the required environment variables are missing', () => {
    let serverProcessManager: ProcessManager;
    const errorPage = `http://localhost:${clientPort}/error`;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      await deactivateEnvironmentFile(projectName);
      await startApplication(serverProcessManager);
    }, 2 * 60e3);

    afterAll(async () => {
      await restoreEnvironmentFile(projectName);
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      expect(page.url()).toEqual(errorPage);
    });
  });

  it.todo('should create a Vue.js project with a custom preset');
});
