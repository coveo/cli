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
import {existsSync} from 'fs-extra';
import {join} from 'path';

interface BuildAppOptions {
  id: string;
  pageId?: string;
  promptAnswer?: string;
}

describe('ui:create:atomic', () => {
  const searchPageEndpoint = 'http://localhost:8888';
  const tokenServerEndpoint = 'http://localhost:8888/.netlify/functions/token';
  const searchInterfaceSelector = 'atomic-search-interface';

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/build finished/)
      .on('stdout')
      .do()
      .once();

  const getProjectName = (id: string) =>
    `${process.env.TEST_RUN_ID}-atomic-project-${id}`;

  const buildApplication = async (
    processManager: ProcessManager,
    options: BuildAppOptions
  ) => {
    let stderr = '';
    const stderrListener = (chunk: string) => {
      stderr += chunk;
    };

    const buildTerminal = await setupUIProject(
      processManager,
      'ui:create:atomic',
      getProjectName(options.id),
      {flags: options.pageId ? ['--pageId', options.pageId] : undefined}
    );

    buildTerminal.orchestrator.process.stderr.on('data', stderrListener);

    if (!options.pageId) {
      await buildTerminal
        .when(/Use an existing hosted search page/)
        .on('stdout')
        .do(answerPrompt(options.promptAnswer ? options.promptAnswer : EOL))
        .once();
    }

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

    return {stderr};
  };

  const startApplication = async (
    processManager: ProcessManager,
    options: BuildAppOptions,
    debugName = 'atomic-server'
  ) => {
    const args = [...npm(), 'run', 'start'];

    const serverTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: getProjectPath(getProjectName(options.id)),
      },
      processManager,
      `${debugName}-${options.id}`
    );
    return serverTerminal;
  };

  describe.each([
    {
      describeName: 'when using the default page config (pageId not specified)',
      buildAppOptions: {id: 'without-page-id'},
    },
    {
      describeName: 'when using an existing pageId (--pageId flag specified)',
      buildAppOptions: {
        id: 'with-page-id',
        pageId: 'fffaafcc-6863-46cb-aca3-97522fcc0f5d',
      },
    },
    {
      describeName:
        'when using an existing pageId (using the list prompt of available pages)',
      buildAppOptions: {
        id: 'with-page-id-prompt',
        promptAnswer: `\x1B[B ${EOL}`,
      },
    },
  ])('$describeName', ({buildAppOptions}) => {
    const oldEnv = process.env;
    const processManagers: ProcessManager[] = [];
    let stderr: string;
    let browser: Browser;
    let page: Page;

    function projectFileExist(path: string) {
      return existsSync(
        join(
          getProjectPath(getProjectName(buildAppOptions.id)),
          ...path.split('/')
        )
      );
    }

    beforeAll(async () => {
      await loginWithApiKey(
        process.env.PLATFORM_API_KEY!,
        process.env.ORG_ID!,
        process.env.PLATFORM_ENV!
      );
      const processManager = new ProcessManager();
      processManagers.push(processManager);
      browser = await getNewBrowser();
      stderr = (await buildApplication(processManager, buildAppOptions)).stderr;
      await processManager.killAllProcesses();
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
    }, 5 * 30e3);

    it('should use the right configuration', () => {
      const message =
        buildAppOptions.promptAnswer || buildAppOptions.pageId
          ? 'Hosted search page named'
          : 'Using the default search page template.';
      expect(stderr).toContain(message);
    });

    describe('validating files', () => {
      const createdFilesPaths = [
        'package.json',
        'package-lock.json',
        '.gitignore',
        '.env',
        '.env.example',
        'README.md',
        'start-netlify.mjs',
        'netlify.toml',
        'tsconfig.json',
        'stencil.config.ts',
        'lambda',
        'src/index.ts',
        'src/html.d.ts',
        'src/components.d.ts',
        'src/style/index.css',
        'src/pages/index.html',
        'src/components/results-manager/results-manager.tsx',
        'src/components/results-manager/template-1.html',
        'src/components/sample-component/sample-component.tsx',
        'src/components/sample-component/sample-component.css',
        'src/components/sample-result-component/sample-result-component.tsx',
        'src/components/sample-result-component/sample-result-component.css',
      ];

      test.each(createdFilesPaths)(
        'should create the %s file or directory',
        (path) => expect(projectFileExist(path)).toBe(true)
      );

      const deletedFilesPaths = [
        'scripts/clean-up.js',
        'scripts/setup-lamdba.js',
        'scripts/utils.js',
      ];

      test.each(deletedFilesPaths)(
        'should delete the %s file or directory',
        (path) => expect(projectFileExist(path)).toBe(false)
      );
    });

    describe('when the project is configured correctly', () => {
      let serverProcessManager: ProcessManager;
      let interceptedRequests: HTTPRequest[] = [];
      let consoleInterceptor: BrowserConsoleInterceptor;

      beforeAll(async () => {
        serverProcessManager = new ProcessManager();
        processManagers.push(serverProcessManager);
        const appTerminal = await startApplication(
          serverProcessManager,
          buildAppOptions,
          'atomic-server-valid'
        );
        await waitForAppRunning(appTerminal);
      }, 5 * 60e3);

      beforeEach(async () => {
        consoleInterceptor = new BrowserConsoleInterceptor(
          page,
          getProjectName(buildAppOptions.id)
        );
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

      it.skip('should not contain console errors nor warnings', async () => {
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

        expect(
          interceptedRequests.some(isSearchRequestOrResponse)
        ).toBeTruthy();
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
          buildAppOptions,
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
});
