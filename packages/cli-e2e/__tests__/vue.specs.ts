import retry from 'async-retry';
import type {
  HTTPRequest,
  Browser,
  Page,
  ConsoleMessage,
  ConsoleMessageType,
} from 'puppeteer';

import {
  answerPrompt,
  getProjectPath,
  isGenericYesNoPrompt,
  setupUIProject,
} from '../utils/cli';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {isSearchRequest} from '../utils/platform';
import stripAnsi from 'strip-ansi';
import {EOL} from 'os';
import {ProcessManager} from '../utils/processManager';
import {join} from 'path';
import {renameSync} from 'fs-extra';

describe('ui:create:vue', () => {
  let browser: Browser;
  let buildProcessManager: ProcessManager;
  let page: Page;
  const oldEnv = process.env;
  const projectName = `${process.env.GITHUB_ACTION}-vue-project`;
  // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
  const clientPort = '8080';
  const searchPageEndpoint = `http://localhost:${clientPort}`;
  const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;

  const buildApplication = async (processManager: ProcessManager) => {
    const proc = setupUIProject(processManager, 'ui:create:vue', projectName);

    proc.stdout.on('data', async (data) => {
      if (isGenericYesNoPrompt(data.toString())) {
        await answerPrompt(`y${EOL}`, proc);
        return;
      }
    });

    return Promise.race([
      new Promise<void>((resolve) => {
        proc.on('exit', async () => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        proc.stdout.on('data', (data) => {
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
  };

  const startApplication = async (processManager: ProcessManager) => {
    const proc = processManager.spawn('npm', ['run', 'start'], {
      cwd: getProjectPath(projectName),
    });

    return new Promise<void>((resolve) => {
      proc.stdout.on('data', async (data) => {
        if (
          /App running at:/.test(stripAnsi(data.toString()).replace(/\n/g, ''))
        ) {
          resolve();
        }
      });
    });
  };

  const deactivateEnvironmentFile = () => {
    const pathToEnv = getProjectPath(projectName);
    renameSync(join(pathToEnv, '.env'), join(pathToEnv, '.env.disabled'));
  };

  const restoreEnvironmentFile = () => {
    const pathToEnv = getProjectPath(projectName);
    renameSync(join(pathToEnv, '.env.disabled'), join(pathToEnv, '.env'));
  };

  beforeAll(async () => {
    buildProcessManager = new ProcessManager();
    browser = await getNewBrowser();
    await buildApplication(buildProcessManager);
  }, 420e3);

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
    await buildProcessManager.killAllProcesses();
    await browser.close();
  });

  describe('when the project is configured correctly', () => {
    let serverProcessManager: ProcessManager;
    let interceptedRequests: HTTPRequest[] = [];
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      await startApplication(serverProcessManager);
    }, 60e3);

    beforeEach(async () => {
      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      page.removeAllListeners('request');
      interceptedRequests = [];
    });

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it('should not contain console errors nor warnings', async () => {
      const interceptedMessages: ConsoleMessage[] = [];
      const deniedConsoleMessageTypes: ConsoleMessageType[] = [
        'error',
        'warning',
      ];

      page.on('console', (msg) => interceptedMessages.push(msg));

      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle0',
      });

      expect(
        interceptedMessages.some(
          (msg) => deniedConsoleMessageTypes.indexOf(msg.type()) > -1
        )
      ).toBeFalsy();
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
  });

  describe('when the required environment variables are missing', () => {
    let serverProcessManager: ProcessManager;
    const errorPage = `http://localhost:${clientPort}/error`;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      await deactivateEnvironmentFile();
      await startApplication(serverProcessManager);
    }, 60e3);

    afterAll(async () => {
      await restoreEnvironmentFile();
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      expect(page.url()).toEqual(errorPage);
    });
  });

  it.todo('should create a Vue.js project with a custom preset');
});
