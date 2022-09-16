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
import {join, resolve} from 'path';
import {hashElement} from 'folder-hash';
import {renameSync, rmSync} from 'fs';
import retry from 'async-retry';

interface BuildAppOptions {
  id: string;
  pageId?: string;
  pageName?: string;
  skipInstall?: boolean;
}

describe('ui:create:atomic', () => {
  const searchPageEndpoint = 'http://localhost:8888';
  const tokenServerEndpoint = 'http://localhost:8888/.netlify/functions/token';
  const searchInterfaceSelector = 'atomic-search-interface';
  let normalizedProjectDir = '';

  const normalizeProjectDirectory = async (
    buildAppOptions: BuildAppOptions
  ) => {
    const originalProjectDir = resolve(
      join(getProjectPath(getProjectName(buildAppOptions.id)))
    );
    normalizedProjectDir = join(originalProjectDir, '..', 'normalizedDir');
    rmSync(normalizedProjectDir, {recursive: true, force: true});
    await retry(() => {
      renameSync(originalProjectDir, normalizedProjectDir);
    });
  };

  const waitForAppRunning = (appTerminal: Terminal) =>
    appTerminal
      .when(/build finished/)
      .on('stdout')
      .do()
      .once();

  const getProjectName = (id: string) =>
    `${process.env.TEST_RUN_ID}-atomic-project-${id}`;

  const getFlagsFromOptions = (options: BuildAppOptions) =>
    options.pageId ? ['--pageId', options.pageId] : undefined;

  const selectDefaultWithCli = (buildTerminal: Terminal) => {
    buildTerminal
      .when(/Use an existing hosted search page/)
      .on('stdout')
      .do(answerPrompt(EOL))
      .once();
  };

  const selectPageWithCli = (
    options: BuildAppOptions,
    buildTerminal: Terminal
  ) => {
    const osSpecificSelector = process.platform === 'win32' ? '>' : '\u276f'; //❯
    const anotherPageSelectedMatcher = new RegExp(
      `${osSpecificSelector} (?!${options.pageName})`,
      'gm'
    );
    const expectedPageSelectedMatcher = new RegExp(
      `${osSpecificSelector} ${options.pageName}`,
      'gm'
    );
    buildTerminal
      .when(anotherPageSelectedMatcher)
      .on('stdout')
      .do(answerPrompt('\x1B[B'))
      .until(expectedPageSelectedMatcher);
    buildTerminal
      .when(expectedPageSelectedMatcher)
      .on('stdout')
      .do(answerPrompt(EOL))
      .once();
  };

  const buildApplication = async (
    processManager: ProcessManager,
    options: BuildAppOptions
  ) => {
    let output = '';

    const buildTerminal = await setupUIProject(
      processManager,
      'ui:create:atomic',
      getProjectName(options.id),
      {
        flags: getFlagsFromOptions(options),
      }
    );

    buildTerminal.orchestrator.process.stderr.on('data', (chunk: string) => {
      output += chunk;
    });
    buildTerminal.orchestrator.process.stdout.on('data', (chunk: string) => {
      output += chunk;
    });

    if (options.pageName) {
      selectPageWithCli(options, buildTerminal);
    } else if (!options.pageId) {
      selectDefaultWithCli(buildTerminal);
    }

    const streams = ['stdout', 'stderr'] as const;
    const buildTerminalExitPromise = Promise.race([
      buildTerminal.when('exit').on('process').do().once(),
      ...streams.map((stream) =>
        buildTerminal
          .when(options.skipInstall ? /Installing packages/ : /Happy hacking!/)
          .on(stream)
          .do()
          .once()
      ),
    ]);

    await Promise.allSettled(
      streams.map((stream) =>
        buildTerminal
          .when(/\(y\)/)
          .on(stream)
          .do(answerPrompt(`y${EOL}`))
          .until(buildTerminalExitPromise)
      )
    );

    return {output};
  };

  const startApplication = (
    processManager: ProcessManager,
    options: BuildAppOptions,
    debugName = 'atomic-server'
  ) => {
    const args = [...npm(), 'run', 'start'];

    return new Terminal(
      args.shift()!,
      args,
      {
        cwd: normalizedProjectDir,
      },
      processManager,
      `${debugName}-${options.id}`
    );
  };

  describe.each([
    {
      describeName: 'when using an existing pageId (pageId not specified)',
      buildAppOptions: {
        id: 'with-page-id',
        pageId: 'fffaafcc-6863-46cb-aca3-97522fcc0f5d',
        skipInstall: false,
      },
      skipBrowser: false,
    },
    {
      describeName: 'when using the default page config (pageId not specified)',
      buildAppOptions: {id: 'without-page-id', skipInstall: true},
      skipBrowser: true,
    },
    {
      describeName: 'when using an existing pageId (--pageId flag specified)',
      buildAppOptions: {
        id: 'with-page-id',
        pageId: 'fffaafcc-6863-46cb-aca3-97522fcc0f5d',
        skipInstall: true,
      },
      skipBrowser: true,
    },
    {
      describeName:
        'when using an existing pageId (using the list prompt of available pages)',
      buildAppOptions: {
        id: 'with-page-id-prompt',
        pageName: 'cli-tests-do-not-delete',
        skipInstall: true,
      },
      skipBrowser: true,
    },
  ])(
    '$describeName',
    ({
      buildAppOptions,
      skipBrowser,
    }: {
      buildAppOptions: BuildAppOptions;
      skipBrowser: boolean;
    }) => {
      const oldEnv = process.env;
      const processManagers: ProcessManager[] = [];
      let stderr: string;
      let browser: Browser;
      let page: Page;

      beforeAll(async () => {
        await loginWithApiKey(
          process.env.PLATFORM_API_KEY!,
          process.env.ORG_ID!,
          process.env.PLATFORM_ENV!
        );
        const processManager = new ProcessManager();
        processManagers.push(processManager);
        if (!skipBrowser) {
          browser = await getNewBrowser();
        }
        stderr = (await buildApplication(processManager, buildAppOptions))
          .output;
        await processManager.killAllProcesses();
        await normalizeProjectDirectory(buildAppOptions);
      }, 15 * 60e3);

      beforeEach(async () => {
        jest.resetModules();
        process.env = {...oldEnv};
        if (!skipBrowser) {
          page = await openNewPage(browser, page);
        }
      });

      afterEach(async () => {
        if (!skipBrowser) {
          await captureScreenshots(browser);
        }
      });

      afterAll(async () => {
        process.env = oldEnv;
        if (!skipBrowser) {
          await browser.close();
        }
        await Promise.all(
          processManagers.map((manager) => manager.killAllProcesses())
        );
      }, 5 * 30e3);

      it('should use the right configuration', () => {
        const message =
          buildAppOptions.pageId || buildAppOptions.pageName
            ? 'Hosted search page named'
            : 'Using the default search page template.';
        expect(stderr).toContain(message);
      });

      it('the project has been generated properly', async () => {
        expect(
          await hashElement(normalizedProjectDir, {
            folders: {
              exclude: ['**node_modules', 'dist', 'www', '.netlify'],
              ignoreRootName: true,
              ignoreBasename: true,
            },
            files: {
              include: ['*'],
              exclude: [
                '**.env',
                '**package-lock.json',
                '**CHANGELOG.md',
                '**package.json',
                'stencil.config.ts',
                '**index.html',
              ],
              ignoreRootName: true,
              ignoreBasename: true,
            },
          })
        ).toMatchSnapshot();
      });

      if (!skipBrowser) {
        describe('when the project is configured correctly', () => {
          let serverProcessManager: ProcessManager;
          let interceptedRequests: HTTPRequest[] = [];
          let consoleInterceptor: BrowserConsoleInterceptor;

          beforeAll(async () => {
            serverProcessManager = new ProcessManager();
            processManagers.push(serverProcessManager);
            const appTerminal = startApplication(
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
            const tokenResponseListener =
              page.waitForResponse(tokenServerEndpoint);
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
            await dummyServer.start();

            const appTerminal = startApplication(
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
      }
    }
  );
});
