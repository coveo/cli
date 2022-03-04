import type {HTTPRequest, Browser, Page} from 'puppeteer';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {answerPrompt, getProjectPath, setupUIProject} from '../utils/cli';
import {isSearchRequestOrResponse} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {npm} from '../utils/npm';
import {jwtTokenPattern} from '../utils/matcher';
import {EOL} from 'os';
import {DummyServer} from '../utils/server';
import {loginWithApiKey} from '../utils/login';
import {spawnSync} from 'child_process';

describe('ui:create:atomic', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const projectName = `${process.env.TEST_RUN_ID}-atomic-project`;
  const searchPageEndpoint = 'http://localhost:8888';
  const tokenServerEndpoint = 'http://localhost:8888/.netlify/functions/token';
  const searchInterfaceSelector = 'atomic-search-interface';

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/build finished/)
      .on('stdout')
      .do()
      .once();

  const buildApplication = async (processManager: ProcessManager) => {
    const buildTerminal = await setupUIProject(
      processManager,
      'ui:create:atomic',
      projectName
    );

    const buildTerminalExitPromise = Promise.race([
      buildTerminal.when('exit').on('process').do().once(),
      buildTerminal
        .when(/Happy hacking!/)
        .on('stdout')
        .do()
        .once(),
    ]);

    await buildTerminal
      .when(/\(y\)/)
      .on('stderr')
      .do(answerPrompt(`y${EOL}`))
      .until(buildTerminalExitPromise);
  };

  const startApplication = async (
    processManager: ProcessManager,
    debugName = 'atomic-server'
  ) => {
    const args = [...npm(), 'run', 'start'];

    const serverTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: getProjectPath(projectName),
      },
      processManager,
      debugName
    );
    return serverTerminal;
  };

  beforeAll(async () => {
    await loginWithApiKey(
      process.env.PLATFORM_API_KEY!,
      process.env.ORG_ID!,
      process.env.PLATFORM_ENV!
    );
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

    beforeAll(async () => {
      const args = [...npm(), 'install', '-g', '@coveo/create-atomic'];
      spawnSync(args.shift()!, args);
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      const appTerminal = await startApplication(
        serverProcessManager,
        'atomic-server-valid'
      );
      await waitForAppRunning(appTerminal);
    }, 5 * 60e3);

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
      await serverProcessManager.killAllProcesses();
    }, 5 * 30e3);

    it('should not contain console errors nor warnings', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(consoleInterceptor.interceptedMessages).toEqual([]);
    }, 60e3);

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$(searchInterfaceSelector)).not.toBeNull();
    }, 60e3);

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenServerEndpoint);
      page.goto(searchPageEndpoint);
      await page.waitForSelector(searchInterfaceSelector);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(jwtTokenPattern),
      });
    }, 60e3);

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchInterfaceSelector);

      expect(interceptedRequests.some(isSearchRequestOrResponse)).toBeTruthy();
    }, 60e3);
  });

  describe('when the default Stencil port is busy', () => {
    let dummyServer: DummyServer;
    let serverProcessManager: ProcessManager;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);

      dummyServer = new DummyServer(3333);

      const appTerminal = await startApplication(
        serverProcessManager,
        'stencil-port-test'
      );
      await waitForAppRunning(appTerminal);
    }, 2 * 60e3);

    afterAll(async () => {
      await dummyServer.close();
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('Netlify should still load the Stencil app properly', async () => {
      await page.goto(searchPageEndpoint, {
        waitUntil: 'networkidle2',
      });

      expect(await page.$(searchInterfaceSelector)).not.toBeNull();
    }, 60e3);
  });
});
