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
  overwriteEnvFile,
  flushEnvFile,
} from '../utils/file';
import {Terminal} from '../utils/terminal/terminal';
import {BrowserConsoleInterceptor} from '../utils/browserConsoleInterceptor';
import {npm} from '../utils/npm';
import {join} from 'path';
import waitOn from 'wait-on';
import {cpSync} from 'fs';

describe('ui:create:vue', () => {
  let browser: Browser;
  const processManagers: ProcessManager[] = [];
  let page: Page;
  const oldEnv = process.env;
  const parentDir = 'vue';
  const projectName = `${process.env.TEST_RUN_ID}-${parentDir}-project`;
  const projectPath = join(getUIProjectPath(), parentDir, projectName);

  const searchPageEndpoint = () => 'http://localhost:5173';

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/use --host/)
      .on('stdout')
      .do()
      .once();

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

  const startApplication = (
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

  const runLint = async (processManager: ProcessManager) => {
    const args = [...npm(), 'run', 'lint'];

    const lintTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: projectPath,
      },
      processManager,
      'vue-lint'
    );
    let stderr = '';
    lintTerminal.orchestrator.process.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    await lintTerminal.when('exit').on('process').do().once();
    return stderr.trim();
  };

  beforeAll(async () => {
    const buildProcessManager = new ProcessManager();
    processManagers.push(buildProcessManager);
    browser = await getNewBrowser();
    await buildApplication(buildProcessManager);
    cpSync(projectPath, join('artifacts', 'projects'), {recursive: true});
    await buildProcessManager.killAllProcesses();
  }, 15 * 60e3);

  beforeEach(async () => {
    jest.resetModules();
    process.env = {...oldEnv};
    page = await openNewPage(browser, page);
  }, 30e3);

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
    const searchboxSelector = '.v-autocomplete input';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      await waitOn({reverse: true, resources: ['tcp:5173']});
      const appTerminal = startApplication(
        serverProcessManager,
        'vue-server-valid'
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
    }, 5 * 60e3);

    it('should contain search results', async () => {
      await page.goto(searchPageEndpoint(), {
        waitUntil: 'networkidle0',
      });
      const resultSummarySelector =
        '#app .v-main > .v-container > .v-row:nth-of-type(2) > .v-col:nth-of-type(2) > section:nth-of-type(1) > p';
      await page.waitForSelector(resultSummarySelector);

      expect(
        await page.evaluate(
          (selector) =>
            document.querySelector<HTMLParagraphElement>(selector)?.innerText ??
            '',
          resultSummarySelector
        )
      ).toMatch(/Results 1-6/);
    }, 60e3);

    //TODO: https://coveord.atlassian.net/browse/KIT-2414
    it.todo('should not contain console errors nor warnings');

    it('should send a search query on searchbox submit', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle0'});
      await page.waitForSelector(searchboxSelector);

      interceptedRequests = [];

      await page.focus(searchboxSelector);
      await page.keyboard.type('my query');
      await page.keyboard.press('Enter');

      await retry(() => {
        expect(
          interceptedRequests.some(isSearchRequestOrResponse)
        ).toBeTruthy();
      });
    }, 60e3);

    it('should have no lint issue', async () => {
      const lintProcessManager = new ProcessManager();
      processManagers.push(lintProcessManager);
      expect(await runLint(lintProcessManager)).toBe('');
    }, 10e3);
  });

  describe('when the .env file is missing', () => {
    let serverProcessManager: ProcessManager;

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      deactivateEnvironmentFile(projectPath);
      const appTerminal = startApplication(
        serverProcessManager,
        'vue-server-env-missing'
      );
      await waitForAppRunning(appTerminal);
    });

    afterAll(async () => {
      await serverProcessManager.killAllProcesses();
      restoreEnvironmentFile(projectPath);
    }, 30e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle0'});
      expect(page.url()).toEqual(`${searchPageEndpoint()}/error`);
    }, 60e3);
  });

  describe('when required environment variables are not defined', () => {
    let serverProcessManager: ProcessManager;
    let envFileContent = '';

    beforeAll(async () => {
      serverProcessManager = new ProcessManager();
      processManagers.push(serverProcessManager);
      envFileContent = flushEnvFile(projectPath);
      await waitOn({reverse: true, resources: ['tcp:5173']});
      const appTerminal = startApplication(
        serverProcessManager,
        'vue-server-invalid'
      );
      await waitForAppRunning(appTerminal);
    }, 2 * 60e3);

    afterAll(async () => {
      overwriteEnvFile(projectPath, envFileContent);
      await serverProcessManager.killAllProcesses();
    }, 30e3);

    it('should redirect the user to an error page', async () => {
      await page.goto(searchPageEndpoint(), {waitUntil: 'networkidle0'});
      expect(page.url()).toEqual(`${searchPageEndpoint()}/error`);
    }, 60e3);
  });
});
