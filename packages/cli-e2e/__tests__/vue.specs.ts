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
import stripAnsi from 'strip-ansi';
import {EOL} from 'os';
import {ProcessManager} from '../utils/processManager';

describe('ui:create:vue', () => {
  let processManager: ProcessManager;
  let browser: Browser;
  let page: Page;
  const OLD_ENV = process.env;
  const projectName = `${process.env.GITHUB_ACTION}-vue-project`;
  // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
  const clientPort = '8080';
  const searchPageEndpoint = `http://localhost:${clientPort}`;
  const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;

  const buildApplication = async (processManager: ProcessManager) => {
    const buildProcess = setupUIProject(
      processManager,
      'ui:create:vue',
      projectName
    );

    buildProcess.stdout.on('data', async (data) => {
      if (isGenericYesNoPrompt(data.toString())) {
        await answerPrompt(`y${EOL}`, buildProcess);
        return;
      }
    });

    return Promise.race([
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
  };

  const startApplication = async (processManager: ProcessManager) => {
    const startServerProcess = processManager.spawn('npm', ['run', 'start'], {
      cwd: getProjectPath(projectName),
    });

    return new Promise<void>((resolve) => {
      startServerProcess.stdout.on('data', async (data) => {
        if (
          /App running at:/.test(stripAnsi(data.toString()).replace(/\n/g, ''))
        ) {
          resolve();
        }
      });
    });
  };

  const setInvalidEnvironmentVariables = () => {
    process.env.ORGANIZATION_ID = undefined;
    process.env.API_KEY = undefined;
    process.env.USER_EMAIL = undefined;
  };

  beforeEach(async () => {
    jest.resetModules();
    process.env = {...OLD_ENV};
    page = await openNewPage(browser, page);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  afterEach(async () => {
    await captureScreenshots(browser);
  });

  describe('when the project is configured correctly', () => {
    let interceptedRequests: HTTPRequest[] = [];
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      processManager = new ProcessManager();
      browser = await getNewBrowser();

      await buildApplication(processManager);
      await startApplication(processManager);
    }, 420e3);

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

  describe.skip('when the required environment variables are invalid', () => {
    const errorPage = `http://localhost:${clientPort}/error`;
    let page: Page;

    beforeEach(async () => {
      setInvalidEnvironmentVariables();
    });

    beforeAll(async () => {
      processManager = new ProcessManager();
      browser = await getNewBrowser();

      await startApplication(processManager);
    }, 420e3);

    afterAll(async () => {
      await browser.close();
      await processManager.killAllProcesses();
    }, 5e3);

    it('should redirect the user to an error page', async () => {
      await page.waitForNavigation();
      expect(page.url()).toEqual(errorPage);
    });
  });

  it.todo('should create a Vue.js project with a custom preset');
});
