import retry from 'async-retry';
import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {
  answerPrompt,
  isGenericYesNoPrompt,
  setupUIProject,
  getUIProjectPath,
} from '../utils/cli';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {isSearchRequestOrResponse} from '../utils/platform';
import {EOL} from 'os';
import {ProcessManager} from '../utils/processManager';
import {
  deactivateEnvironmentFile,
  restoreEnvironmentFile,
  getPathToEnvFile,
  overwriteEnvFile,
  flushEnvFile,
} from '../utils/file';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {commitProject, undoCommit} from '../utils/git';
import {parse} from 'dotenv';
import {DummyServer} from '../utils/server';
import {appendFileSync, readFileSync, truncateSync} from 'fs';
import getPort from 'get-port';
import {npm} from '../utils/npm';
import axios from 'axios';
import {jwtTokenPattern} from '../utils/matcher';
import {join} from 'path';

describe('ui:create:vue', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const parentDir = 'vue';
  const projectName = `${process.env.TEST_RUN_ID}-${parentDir}-project`;
  const projectPath = join(getUIProjectPath(), parentDir, projectName);
  let clientPort: number;
  let serverPort: number;

  const searchPageEndpoint = () => `http://localhost:${clientPort}`;

  const tokenServerEndpoint = () => `http://localhost:${serverPort}/token`;

  const forceApplicationPorts = (clientPort: number, serverPort: number) => {
    const envPath = getPathToEnvFile(projectPath);
    const environment = parse(readFileSync(envPath, {encoding: 'utf-8'}));

    const updatedEnvironment = {
      ...environment,
      PORT: clientPort,
      VUE_APP_SERVER_PORT: serverPort,
    };
    truncateSync(envPath);
    for (const [key, value] of Object.entries(updatedEnvironment)) {
      appendFileSync(envPath, `${key}=${value}${EOL}`);
    }
  };

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/App running at:/)
      .on('stdout')
      .do()
      .once();

  const getAllocatedPorts = () => {
    const envVariables = parse(
      readFileSync(getPathToEnvFile(projectPath), {encoding: 'utf-8'})
    );

    if (!envVariables) {
      throw new Error('Unable to load project environment variables');
    }

    clientPort = parseInt(envVariables.PORT);
    serverPort = parseInt(envVariables.VUE_APP_SERVER_PORT);

    return [clientPort, serverPort];
  };

  const buildApplication = async (processManager: ProcessManager) => {
    const buildTerminal = await setupUIProject(
      processManager,
      'ui:create:vue',
      projectName,
      {projectDir: projectPath}
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
      .when(isGenericYesNoPrompt)
      .on('stdout')
      .do(answerPrompt(`y${EOL}`))
      .until(buildTerminalExitPromise);

    await buildTerminalExitPromise;
  };

  const startApplication = async (
    processManager: ProcessManager,
    debugName = 'vue-server'
  ) => {
    const args = [...npm(), 'run', 'start'];

    const serverTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: projectPath,
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
    const searchboxSelector = '#search-page .autocomplete input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      const appTerminal = await startApplication(
        serverProcessManager,
        'vue-server-valid'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
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
      await undoCommit(serverProcessManager, projectPath, projectName);
      await serverProcessManager.killAllProcesses();
    }, 5 * 60e3);

    it('should not contain console errors nor warnings', async () => {
      await page.goto(searchPageEndpoint(), {
        waitUntil: 'networkidle2',
      });

      expect(consoleInterceptor.interceptedMessages).toEqual([]);
    });

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint(), {
        waitUntil: 'networkidle2',
      });
      await page.waitForSelector(searchboxSelector);

      expect(await page.$('#search-page')).not.toBeNull();
    });

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenServerEndpoint());

      page.goto(searchPageEndpoint());
      await page.waitForSelector(searchboxSelector);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(jwtTokenPattern),
      });
    });

    it('should send a search query when the page is loaded', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchboxSelector);

      expect(interceptedRequests.some(isSearchRequestOrResponse)).toBeTruthy();
    });

    it('should send a search query on searchbox submit', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle2'});
      await page.waitForSelector(searchboxSelector);

      interceptedRequests = [];

      await page.focus(searchboxSelector);
      await page.keyboard.type('my query');
      await page.keyboard.press('Enter');

      await retry(async () => {
        expect(
          interceptedRequests.some(isSearchRequestOrResponse)
        ).toBeTruthy();
      });
    });

    it('should be commited without lint-stage errors', async () => {
      const eslintErrorSpy = jest.fn();

      await commitProject(
        serverProcessManager,
        projectPath,
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
    }, 30e3);

    it(
      'should not have any ESLint warning or error',
      async () => {
        const serverTerminal = await startApplication(
          serverProcessManager,
          'vue-server-eslint'
        );
        const eslintErrorSpy = jest.fn();

        await serverTerminal
          .when(/✖ \d+ problems \(\d+ errors, \d+ warnings\)/)
          .on('stdout')
          .do(eslintErrorSpy)
          .until(waitForAppRunning(serverTerminal));

        expect(eslintErrorSpy).not.toBeCalled();
      },
      5 * 60e3
    );
  });

  describe('when the .env file is missing', () => {
    let serverProcessManager: ProcessManager;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      deactivateEnvironmentFile(projectPath);
    });

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
      restoreEnvironmentFile(projectPath);
    }, 30e3);

    it(
      'should not start the application',
      async () => {
        const missingEnvErrorSpy = jest.fn();

        const appTerminal = await startApplication(
          serverProcessManager,
          'vue-server-missing-env'
        );

        await appTerminal
          .when(/\.env file not found in the project root/)
          .on('stderr')
          .do(missingEnvErrorSpy)
          .once();

        expect(missingEnvErrorSpy).toHaveBeenCalled();
      },
      2 * 60e3
    );
  });

  describe('when required environment variables are not defined', () => {
    let serverProcessManager: ProcessManager;
    let envFileContent = '';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      envFileContent = flushEnvFile(projectPath);
      const appTerminal = await startApplication(
        serverProcessManager,
        'vue-server-invalid'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 2 * 60e3);

    afterAll(async () => {
      overwriteEnvFile(projectPath, envFileContent);
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle2'});
      expect(page.url()).toEqual(`${searchPageEndpoint()}/error`);
    });
  });

  describe('when the ports are manually specified', () => {
    let serverProcessManager: ProcessManager;
    let hardCodedClientPort: number;
    let hardCodedServerPort: number;

    beforeAll(async () => {
      hardCodedClientPort = await getPort();
      hardCodedServerPort = await getPort();
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      forceApplicationPorts(hardCodedClientPort, hardCodedServerPort);

      const appTerminal = await startApplication(
        serverProcessManager,
        'vue-server-port-test'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 2 * 60e3);

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('should run the application on the specified port', async () => {
      expect(clientPort).toEqual(hardCodedClientPort);
    });

    it('should run the token server on the specified port', async () => {
      expect(serverPort).toEqual(hardCodedServerPort);
    });
  });

  describe('when the ports are busy', () => {
    const dummyServers: DummyServer[] = [];
    let serverProcessManager: ProcessManager;
    let usedClientPort: number;
    let usedServerPort: number;

    beforeAll(async () => {
      usedClientPort = await getPort();
      usedServerPort = await getPort();
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      forceApplicationPorts(usedClientPort, usedServerPort);

      dummyServers.push(
        new DummyServer(usedClientPort),
        new DummyServer(usedServerPort)
      );

      const appTerminal = await startApplication(
        serverProcessManager,
        'vue-server-port-test'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 2 * 60e3);

    afterAll(async () => {
      await Promise.all(dummyServers.map((server) => server.close()));
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('should allocate a new port for the application', async () => {
      expect(clientPort).not.toEqual(usedClientPort);
    });

    it('should not use an undefined port for application', async () => {
      expect(clientPort).not.toBeUndefined();
    });

    it('should allocate a new port for the token server', async () => {
      expect(serverPort).not.toEqual(usedServerPort);
    });

    it('should not use an undefined port for token server', async () => {
      expect(serverPort).not.toBeUndefined();
    });

    it('should run the application on a new port', async () => {
      await expect(
        page.goto(searchPageEndpoint(), {waitUntil: 'load'})
      ).resolves.not.toThrow();
    });

    it('should run the server on a new port', async () => {
      const tokenRequest = await axios.get(tokenServerEndpoint());
      expect(tokenRequest.data.token).toMatch(jwtTokenPattern);
    });
  });

  it.todo('should create a Vue.js project with a custom preset');
});
