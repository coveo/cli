import retry from 'async-retry';

import type {HTTPRequest, Browser, Page} from 'puppeteer';

import {
  answerPrompt,
  isGenericYesNoPrompt,
  setupUIProject,
  getUIProjectPath,
} from '../utils/cli';
import {
  deactivateEnvironmentFile,
  flushEnvFile,
  getPathToEnvFile,
  overwriteEnvFile,
  restoreEnvironmentFile,
} from '../utils/file';
import {captureScreenshots, getNewBrowser, openNewPage} from '../utils/browser';
import {isSearchRequestOrResponse} from '../utils/platform';
import {EOL} from 'os';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {commitProject, undoCommit} from '../utils/git';
import {resolve, join} from 'path';
import {parse} from 'dotenv';
import {readFileSync, writeFileSync, truncateSync, appendFileSync} from 'fs';
import {DummyServer} from '../utils/server';
import getPort from 'get-port';
import {npm} from '../utils/npm';
import axios from 'axios';
import {jwtTokenPattern} from '../utils/matcher';

// TODO CDX-804: Enable the tests back
describe('ui:create:angular', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const parentDir = 'angular';
  const projectName = `${process.env.TEST_RUN_ID}-${parentDir}-project`;
  const projectPath = join(getUIProjectPath(), parentDir, projectName);
  let clientPort: number;
  let serverPort: number;
  const angularJsonPath = join(projectPath, 'angular.json');

  const searchPageEndpoint = () => `http://localhost:${clientPort}`;

  const tokenServerEndpoint = () => `http://localhost:${serverPort}/token`;

  const setCustomTokenEndpoint = (endpoint: string) => {
    const webAppEnvironment = resolve(
      projectPath,
      'src',
      'environments',
      'environment.ts'
    );
    const portNumberMatcher = /customTokenEndpoint:\s?.*$/m;
    const appEnvironmentFile = readFileSync(webAppEnvironment, 'utf-8');
    const subst = `customTokenEndpoint: '${endpoint}',`;
    const updatedEnvironment = appEnvironmentFile.replace(
      portNumberMatcher,
      subst
    );

    writeFileSync(webAppEnvironment, updatedEnvironment);
  };

  const resetCustomTokenEndpoint = () => setCustomTokenEndpoint('');

  const forceTokenServerPort = (port: number) => {
    const pathToEnv = resolve(projectPath, 'server', '.env');
    const environment = parse(readFileSync(pathToEnv, {encoding: 'utf-8'}));

    const updatedEnvironment = {
      ...environment,
      SERVER_PORT: port,
    };

    truncateSync(pathToEnv);
    for (const [key, value] of Object.entries(updatedEnvironment)) {
      appendFileSync(pathToEnv, `${key}=${value}${EOL}`);
    }
  };

  const forceAppPort = (port: number) => {
    const angularJSON = JSON.parse(readFileSync(angularJsonPath, 'utf-8'));

    const serve = angularJSON.projects[projectName].architect.serve;
    if (!serve.options) {
      serve.options = {};
    }
    serve.options.port = port;

    writeFileSync(angularJsonPath, JSON.stringify(angularJSON, undefined, 2));
  };

  const getAllocatedPorts = () => {
    const envVariables = parse(
      readFileSync(getPathToEnvFile(join(projectPath, 'server')))
    );

    if (!envVariables) {
      throw new Error('Unable to load project environment variables');
    }

    serverPort = parseInt(envVariables.SERVER_PORT);

    const angularJSON = JSON.parse(readFileSync(angularJsonPath, 'utf-8'));
    const servePort =
      angularJSON.projects[projectName].architect.serve.options.port;
    clientPort = parseInt(servePort);

    return [clientPort, serverPort];
  };

  const buildApplication = async (processManager: ProcessManager) => {
    const buildTerminal = await setupUIProject(
      processManager,
      'ui:create:angular',
      projectName,
      {
        flags: ['--defaults'],
        projectDir: projectPath,
      }
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
      .on('stderr')
      .do(answerPrompt(`y${EOL}`))
      .until(buildTerminalExitPromise);
  };

  const startApplication = async (
    processManager: ProcessManager,
    debugName = 'angular-server'
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

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/Compiled successfully/)
      .on('stdout')
      .do()
      .once();

  beforeAll(async () => {
    const buildProcessManager = new ProcessManager();
    processManagers.push(buildProcessManager);
    browser = await getNewBrowser();
    await buildApplication(buildProcessManager);
    await buildProcessManager.killAllProcesses();
  }, 20 * 60e3);

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
    const searchboxSelector = 'app-search-page app-search-box input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      const appTerminal = await startApplication(
        serverProcessManager,
        'angular-server-valid'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 15 * 60e3);

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

    it(
      'should not contain console errors nor warnings',
      async () => {
        await page.goto(searchPageEndpoint(), {
          waitUntil: 'networkidle2',
        });

        expect(consoleInterceptor.interceptedMessages).toEqual([]);
      },
      5 * 60e3
    );

    it('should contain a search page section', async () => {
      await page.goto(searchPageEndpoint(), {
        waitUntil: 'networkidle2',
      });
      await page.waitForSelector(searchboxSelector);

      expect(await page.$('app-search-page')).not.toBeNull();
    }, 60e3);

    it('should retrieve the search token on the page load', async () => {
      const tokenResponseListener = page.waitForResponse(tokenServerEndpoint());

      page.goto(searchPageEndpoint());
      await page.waitForSelector(searchboxSelector);

      expect(
        JSON.parse(await (await tokenResponseListener).text())
      ).toMatchObject({
        token: expect.stringMatching(jwtTokenPattern),
      });
    }, 60e3);

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
    }, 60e3);

    it('should be commited without lint-stage errors', async () => {
      const eslintErrorSpy = jest.fn();

      await commitProject(
        serverProcessManager,
        projectPath,
        projectName,
        eslintErrorSpy
      );

      expect(eslintErrorSpy).not.toBeCalled();
    }, 60e3);
  });

  describe('when the .env file is missing', () => {
    let serverProcessManager: ProcessManager;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      deactivateEnvironmentFile(join(projectPath, 'server'));
    });

    afterAll(async () => {
      restoreEnvironmentFile(join(projectPath, 'server'));
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it(
      'should not start the application',
      async () => {
        const missingEnvErrorSpy = jest.fn();

        const appTerminal = await startApplication(
          serverProcessManager,
          'angular-server-missing-env'
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

  describe('when the required environment variables are missing', () => {
    let serverProcessManager: ProcessManager;
    let envFileContent = '';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      envFileContent = flushEnvFile(join(projectPath, 'server'));
      const appTerminal = await startApplication(
        serverProcessManager,
        'angular-server-invalid'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 2 * 60e3);

    afterAll(async () => {
      overwriteEnvFile(join(projectPath, 'server'), envFileContent);
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle2'});
      expect(page.url()).toEqual(`${searchPageEndpoint()}/error`);
    });
  });

  describe('when the a custom token Endpoint is specified', () => {
    const customTokenEndpoint = 'http://dummyendpoint.com/some-kind-of-path';
    let serverProcessManager: ProcessManager;
    let interceptedRequests: HTTPRequest[] = [];

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      setCustomTokenEndpoint(customTokenEndpoint);

      const appTerminal = await startApplication(
        serverProcessManager,
        'angular-server-port-test'
      );
      await waitForAppRunning(appTerminal);
      [clientPort, serverPort] = getAllocatedPorts();
    }, 2 * 60e3);

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
      resetCustomTokenEndpoint();
    }, 30e3);

    beforeEach(async () => {
      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterEach(async () => {
      page.removeAllListeners('request');
      interceptedRequests = [];
    });

    it('should use the custom token endpoint', async () => {
      page.goto(searchPageEndpoint());

      await retry(async () => {
        expect(
          interceptedRequests.some(
            (request: HTTPRequest) => request.url() === customTokenEndpoint
          )
        ).toBeTruthy();
      });
    }, 10e3);
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
      forceAppPort(usedClientPort);
      forceTokenServerPort(usedServerPort);

      dummyServers.push(
        new DummyServer(usedClientPort),
        new DummyServer(usedServerPort)
      );

      const appTerminal = await startApplication(
        serverProcessManager,
        'angular-server-port-test'
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
});
