import retry from 'async-retry';

import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {getProjectPath, setupUIProject} from '../utils/cli';
import {isSearchRequest} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {deactivateEnvironmentFile, restoreEnvironmentFile} from '../utils/file';

describe('ui:create:react', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const projectName = `${process.env.GITHUB_ACTION}-react-project`;
  // TODO: CDX-90: Assign a dynamic port for the search token server on all ui projects
  const clientPort = '3000';
  const searchPageEndpoint = `http://localhost:${clientPort}`;
  const tokenProxyEndpoint = `http://localhost:${clientPort}/token`;

  const buildApplication = async (processManager: ProcessManager) => {
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
  };

  const startApplication = async (processManager: ProcessManager) => {
    const serverTerminal = new Terminal(
      'npm',
      ['run', 'start'],
      {
        cwd: getProjectPath(projectName),
      },
      processManager,
      'react-server'
    );

    await serverTerminal
      .when(/You can now view .*-react-project in the browser/)
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
    const searchboxSelector = 'div.App .MuiAutocomplete-root input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      await startApplication(serverProcessManager);
    }, 2 * 60e3);

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

  describe('when the required environment variables are missing', () => {
    let serverProcessManager: ProcessManager;
    const errorMessageSelector = 'div.container';

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
      const pageErrorMessage = await page.$eval(
        errorMessageSelector,
        (el) => el.textContent
      );
      expect(pageErrorMessage).toContain(
        'You should have a valid .env file at the root of this project'
      );
    });
  });
});
