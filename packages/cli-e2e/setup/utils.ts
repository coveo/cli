import {mkdirSync, copyFileSync, copySync} from 'fs-extra';
import {dirSync as tmpDirSync} from 'tmp';
import {randomBytes} from 'crypto';
import {launch as launchChrome} from 'chrome-launcher';
import type {Browser} from 'puppeteer';
import {captureScreenshots, connectToChromeBrowser} from '../utils/browser';
import {clearAccessTokenFromConfig, loginWithOffice} from '../utils/login';
import {getPlatformHost} from '../utils/platform';
import {getConfig as getCliConfig, getConfigFilePath} from '../utils/cli';
import waitOn from 'wait-on';
import 'dotenv/config';
import {Terminal} from '../utils/terminal/terminal';
import {join, resolve} from 'path';
import {npm, npmCachePathEnvVar, npmPathEnvVar} from '../utils/npm';
import {dirname} from 'path';
import {spawnSync} from 'child_process';

async function clearChromeBrowsingData(browser: Browser) {
  const pages = await browser.pages();

  const pageClearDataPromise = [];
  for (const page of pages) {
    const client = await page.target().createCDPSession();
    pageClearDataPromise.push(client.send('Network.clearBrowserCookies'));
    pageClearDataPromise.push(client.send('Network.clearBrowserCache'));
  }
  return Promise.all(pageClearDataPromise);
}

export const CLI_CONFIG_JSON_CI_KEY = 'cliConfigJson';

export async function authenticateCli() {
  let browser;
  let chrome;
  try {
    console.log('Starting Chrome');
    chrome = await launchChrome({
      port: 9222,
      userDataDir: false,
      connectionPollInterval: 1e3,
      maxConnectionRetries: 60,
      logLevel: 'verbose',
    });
    console.log('Chrome started');
    console.log('Checking port 9222');
    await waitOn({resources: ['tcp:9222']});
    console.log('Port 9222 is open');
    console.log('Connecting to Chrome');
    browser = await connectToChromeBrowser();
    console.log('Connected to Chrome');
    await clearChromeBrowsingData(browser);
    await clearAccessTokenFromConfig();
    await loginWithOffice(browser);
    await clearChromeBrowsingData(browser);
  } catch (e) {
    if (browser) {
      await captureScreenshots(browser, 'jestSetup');
    }
    throw e;
  } finally {
    await chrome?.kill();
  }
}

export function createUiProjectDirectory() {
  const uiProjectDir = tmpDirSync();
  process.env.UI_PROJECT_PATH = uiProjectDir.name;
}

export function setProcessEnv() {
  process.env.TEST_RUN_ID =
    process.env.TEST_RUN_ID ?? `id${randomBytes(16).toString('hex')}g`;
  process.env.PLATFORM_ENV = process.env.PLATFORM_ENV?.toLowerCase() || '';
  process.env.PLATFORM_HOST = getPlatformHost(process.env.PLATFORM_ENV);
  process.env.CLI_EXEC_PATH =
    process.env.CI && process.env.E2E_USE_NPM_REGISTRY
      ? resolveBinary('coveo')
      : resolve(__dirname, '../../cli/bin/dev');
  process.stdout.write(`CLI PATH : ${process.env.CLI_EXEC_PATH}`);
}

export async function publishPackages() {
  const args = [...npm(), 'run', 'npm:publish:template'];
  const publishTerminal = new Terminal(
    args.shift()!,
    args,
    {cwd: resolve(join(__dirname, '..', '..', '..'))},
    global.processManager!,
    'npmPublish'
  );
  publishTerminal.orchestrator.process.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  publishTerminal.orchestrator.process.stderr.on('data', (data) => {
    console.log(data.toString());
  });
  await publishTerminal.when('exit').on('process').do().once();
}

export async function startVerdaccio() {
  mkdirSync(
    resolve(join(__dirname, '..', 'verdaccio', 'verdaccio', 'storage')),
    {
      recursive: true,
    }
  );
  const args = [...npm(), 'run', 'verdaccio'];
  const verdaccioTerminal = new Terminal(
    args.shift()!,
    args,
    {cwd: resolve(join(__dirname, '..')), detached: process.env.CI === 'true'},
    global.processManager!,
    'verdaccio'
  );
  await verdaccioTerminal
    .when(/localhost:4873/)
    .on('stdout')
    .do()
    .once();
  await waitOn({resources: ['tcp:4873']});
}

export function useCIConfigIfEnvIncomplete() {
  const cliConfig = getCliConfig();
  process.env.PLATFORM_ENV = process.env.PLATFORM_ENV || cliConfig.environment;
  process.env.ORG_ID = process.env.ORG_ID || cliConfig.organization;
  process.env.PLATFORM_API_KEY =
    process.env.PLATFORM_API_KEY || cliConfig.accessToken;
}

export function restoreCliConfig() {
  mkdirSync(dirname(getConfigFilePath()), {recursive: true});
  copyFileSync('decrypted', getConfigFilePath());
}

export function shimNpm() {
  const tmpDir = tmpDirSync();
  const npmDir = join(tmpDir.name, 'npmShim');
  process.env[npmCachePathEnvVar] = join(npmDir, 'cache');
  copySync(join(__dirname, '..', 'npm-shim'), npmDir);
  const npmCiArgs = [appendCmdIfWindows`npm`, 'ci'];
  spawnSync(npmCiArgs.shift()!, npmCiArgs, {cwd: npmDir});
  process.env[npmPathEnvVar] = resolve(
    npmDir,
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js'
  );
}

export const resolveBinary = (programName: string) => {
  const whereOrWhich = process.platform === 'win32' ? 'where.exe' : 'which';
  const spawner = spawnSync(whereOrWhich, [programName], {
    shell: true,
    encoding: 'utf-8',
  });
  return spawner.stdout.trim();
};

const appendCmdIfWindows = (cmd: TemplateStringsArray) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;
