import {mkdirSync, copyFileSync} from 'fs';
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
import {npm} from '../utils/npm';
import {MITM_BIN_NAME, resolveBinary} from '../utils/mitmproxy';
import {parse, dirname} from 'path';

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
    {cwd: resolve(join(__dirname, '..'))},
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
  process.env.ACCESS_TOKEN = process.env.ACCESS_TOKEN || cliConfig.accessToken;
}

export function ensureMitmProxyInstalled(): void | never {
  const pathCandidate = resolveBinary(MITM_BIN_NAME);
  try {
    parse(pathCandidate);
  } catch (error) {
    throw 'mitmdump not found in Path. Please install mitmproxy and add its binaries to your path';
  }
}

export function restoreCliConfig() {
  mkdirSync(dirname(getConfigFilePath()), {recursive: true});
  copyFileSync('decrypted', getConfigFilePath());
}
