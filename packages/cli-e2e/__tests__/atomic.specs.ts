import type {HTTPRequest, Browser, Page} from 'puppeteer';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {getProjectPath, setupUIProject} from '../utils/cli';
import {isSearchRequest} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {isDirectoryClean} from '../utils/git';
import {npm} from '../utils/windows';
import {jwtTokenPattern} from '../utils/matcher';

describe('ui:create:atomic', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const projectName = `${process.env.TEST_RUN_ID}-atomic-project`;
  const searchPageEndpoint = 'http://localhost:8888';
  const tokenServerEndpoint = 'http://localhost:8888/.netlify/functions/token';

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/Project is running at/)
      .on('stdout')
      .do()
      .once();

  const buildApplication = async (processManager: ProcessManager) => {
    const buildTerminal = setupUIProject(
      processManager,
      'ui:create:atomic',
      projectName
    );

    await Promise.race([
      buildTerminal.when('exit').on('process').do().once(),
      buildTerminal
        .when(/Happy hacking!/)
        .on('stdout')
        .do()
        .once(),
    ]);
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
    const searchInterfaceSelector = 'atomic-search-interface';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      const appTerminal = await startApplication(
        serverProcessManager,
        'atomic-server-valid'
      );
      await waitForAppRunning(appTerminal);
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
      await serverProcessManager.killAllProcesses();
    }, 30e3);

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
      await page.waitForSelector(searchInterfaceSelector);

      expect(await page.$('atomic-search-interface')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenServerEndpoint);

      page.goto(searchPageEndpoint);
      await page.waitForSelector(searchInterfaceSelector);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(jwtTokenPattern),
      });
    });

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchInterfaceSelector);

      expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
    });

    // it('should send a search query on searchbox submit', async () => {
    //   await page.goto(searchPageEndpoint, {waitUntil: 'networkidle2'});
    //   const searchBox = await page.waitForSelector('atomic-search-box');

    //   interceptedRequests = [];

    //   await page.focus(searchboxSelector);
    //   await page.keyboard.type('my query');
    //   await page.keyboard.press('Enter');

    //   await retry(async () => {
    //     expect(interceptedRequests.some(isSearchRequest)).toBeTruthy();
    //   });
    // });

    it('should have a clean working directory', async () => {
      const gitDirtyWorkingTreeSpy = jest.fn();

      await isDirectoryClean(
        serverProcessManager,
        getProjectPath(projectName),
        projectName,
        gitDirtyWorkingTreeSpy
      );

      expect(gitDirtyWorkingTreeSpy).not.toBeCalled();
    }, 10e3);
  });

  //   describe('when the .env file is missing', () => {
  //     let serverProcessManager: ProcessManager;

  //     beforeAll(async () => {
  //       serverProcessManager = new ProcessManager();
  //       processManagers.push(serverProcessManager);
  //       deactivateEnvironmentFile(projectName);
  //     });

  //     afterAll(async () => {
  //       restoreEnvironmentFile(projectName);
  //       await serverProcessManager.killAllProcesses();
  //     }, 30e3);

  //     it(
  //       'should not start the application',
  //       async () => {
  //         const missingEnvErrorSpy = jest.fn();

  //         const appTerminal = await startApplication(
  //           serverProcessManager,
  //           'react-server-missing-env'
  //         );

  //         await appTerminal
  //           .when(/\.env file not found in the project root/)
  //           .on('stderr')
  //           .do(missingEnvErrorSpy)
  //           .once();

  //         expect(missingEnvErrorSpy).toHaveBeenCalled();
  //       },
  //       2 * 60e3
  //     );
  //   });

  //   describe('when required environment variables are not defined', () => {
  //     let serverProcessManager: ProcessManager;
  //     let envFileContent = '';
  //     const errorMessageSelector = 'div.container';

  //     beforeAll(async () => {
  //       serverProcessManager = new ProcessManager();
  //       processManagers.push(serverProcessManager);
  //       envFileContent = flushEnvFile(projectName);
  //       const appTerminal = await startApplication(
  //         serverProcessManager,
  //         'react-server-invalid'
  //       );
  //       await waitForAppRunning(appTerminal);
  //       [clientPort, serverPort] = getAllocatedPorts();
  //     }, 2 * 60e3);

  //     afterAll(async () => {
  //       overwriteEnvFile(projectName, envFileContent);
  //       await serverProcessManager.killAllProcesses();
  //     }, 30e3);

  //     it('should redirect the user to an error page', async () => {
  //       await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle2'});
  //       const pageErrorMessage = await page.$eval(
  //         errorMessageSelector,
  //         (el) => el.textContent
  //       );
  //       expect(pageErrorMessage).toContain(
  //         'You should have a valid .env file at the root of this project'
  //       );
  //     });
  //   });
});
