import retry from 'async-retry';
import type {
  HTTPRequest,
  Browser,
  Page,
  ConsoleMessageType,
  CDPSession,
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
import {deactivateEnvironmentFile, restoreEnvironmentFile} from '../utils/file';
import {Runtime} from 'node:inspector';

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

  beforeAll(async () => {
    buildProcessManager = new ProcessManager();
    browser = await getNewBrowser();
    await buildApplication(buildProcessManager);
    await buildProcessManager.killAllProcesses();
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
    await browser.close();
  });

  describe('when the project is configured correctly', () => {
    let serverProcessManager: ProcessManager;
    let interceptedRequests: HTTPRequest[] = [];
    let cdpClient: CDPSession;
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      await startApplication(serverProcessManager);
    }, 60e3);

    beforeEach(async () => {
      cdpClient = await page.target().createCDPSession();
      await cdpClient.send('Runtime.enable');

      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      page.removeAllListeners('request');
      cdpClient.removeAllListeners('Runtime.consoleAPICalled');
      interceptedRequests = [];
    });

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
    }, 5e3);

    it('should not contain console errors nor warnings', async () => {
      const interceptedConsoleMessages: string[] = [];
      const deniedConsoleMessageTypes: ConsoleMessageType[] = [
        'error',
        'warning',
      ];

      cdpClient.on(
        'Runtime.consoleAPICalled',
        (message: Runtime.ConsoleAPICalledEventDataType) => {
          if (
            deniedConsoleMessageTypes.indexOf(
              message.type as ConsoleMessageType
            ) > -1
          ) {
            message.args.forEach((arg) => {
              arg.description &&
                interceptedConsoleMessages.push(arg.description);
            });
          }
        }
      );

      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle0',
      });

      expect(interceptedConsoleMessages).toEqual([]);
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
      await deactivateEnvironmentFile(projectName);
      await startApplication(serverProcessManager);
    }, 60e3);

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
