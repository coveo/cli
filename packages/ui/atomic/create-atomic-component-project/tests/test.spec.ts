import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {lookup} from 'node:dns/promises';
import {npmSync, npmAsync} from '@coveo/do-npm';
import {getStdoutStderrBuffersFromProcess} from '@coveo/process-helpers';
import {isSearchRequestOrResponse} from '@coveo/puppeteer-helpers';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {Browser, HTTPRequest, launch as launchBrowser, Page} from 'puppeteer';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import waitOn from 'wait-on';
import retry from 'async-retry';
import treeKill from 'tree-kill-promise';

const PACKAGE_NAME = '@coveo/create-atomic-component-project';

describe(PACKAGE_NAME, () => {
  let verdaccioProcess: ChildProcess;
  let verdaccioUrl: string;
  let tempDirectory: DirResult;
  let testDirectory: string;

  beforeAll(async () => {
    ({verdaccioUrl, verdaccioProcess} = await startVerdaccio(PACKAGE_NAME));
    tempDirectory = dirSync({unsafeCleanup: true});
    testDirectory = join(tempDirectory.name, 'testDirectory');
    mkdirSync(testDirectory);
  });

  afterAll(async () => {
    await treeKill(verdaccioProcess.pid);
    tempDirectory.removeCallback();
  });

  it('should initialize a base project', async () => {
    npmSync(['init', PACKAGE_NAME.replace('/create-', '/')], {
      env: {
        ...process.env,
        npm_config_registry: verdaccioUrl,
        npm_config_cache: dirSync({unsafeCleanup: true}).name,
      },
      cwd: testDirectory,
    });

    expect(
      await hashElement(testDirectory, {
        folders: {
          ignoreRootName: true,
          ignoreBasename: true,
        },
        files: {
          include: ['*'],
          ignoreRootName: true,
          ignoreBasename: true,
        },
      })
    ).toMatchSnapshot();
  });

  it('should be able to install all deps without issues', () => {
    expect(
      npmSync(['install'], {
        cwd: testDirectory,
        env: {...process.env, npm_config_registry: verdaccioUrl},
      }).status
    ).toBe(0);
  });

  describe('when running npm start', () => {
    const serveAddressMatcher = /http:\/\/localhost:\d*/gm;
    let serveAddress: string;
    let startProcess: ChildProcess;
    let browser: Browser;
    let page: Page;
    let interceptedRequests: HTTPRequest[];
    let startProcessOutputs: {
      readonly stdout: string;
      readonly stderr: string;
    };

    beforeAll(async () => {
      startProcess = npmAsync(['start'], {cwd: testDirectory});
      startProcessOutputs = getStdoutStderrBuffersFromProcess(startProcess);
      browser = await launchBrowser();
      page = await browser.newPage();
      interceptedRequests = [];
      page.on('request', (request: HTTPRequest) => {
        interceptedRequests.push(request);
      });
    });

    afterAll(async () => {
      await browser.close();
      await treeKill(startProcess.pid);
    });

    it('should eventually display the serve address', async () => {
      await retry(
        () => {
          expect(startProcessOutputs.stderr).toMatch(serveAddressMatcher);
        },
        {
          maxRetryTime: 2 * 60e3,
        }
      );
      const serveAddressUrl = new URL(
        serveAddressMatcher.exec(startProcessOutputs.stderr)[0]
      );
      const resolvedHostname = (await lookup(serveAddressUrl.hostname, 4))
        .address;
      serveAddressUrl.hostname = resolvedHostname;
      serveAddress = serveAddressUrl.toString();
    });

    it('should actually serve on this address', async () => {
      await expect(
        waitOn({
          resources: [serveAddress],
        })
      ).resolves.not.toThrow();
    });

    it('should build succesfully', async () => {
      expect(startProcessOutputs.stderr).not.toMatch(
        'build failed, watching for changes'
      );
      expect(startProcessOutputs.stderr).toMatch(
        'build finished, watching for changes'
      );
    });

    it('should do some search query when loading the page', async () => {
      await page.goto(serveAddress, {waitUntil: 'networkidle2'});
      expect(interceptedRequests.some(isSearchRequestOrResponse)).toBe(true);
    });
  });
});
