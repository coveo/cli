import {mkdirSync} from 'fs';
import {dirSync as tmpDirSync} from 'tmp';
import {randomBytes} from 'crypto';
import {launch as launchChrome} from 'chrome-launcher';
import type {Browser} from 'puppeteer';
import {
  captureScreenshots,
  connectToChromeBrowser,
  SCREENSHOTS_PATH,
} from './utils/browser';
import {clearAccessTokenFromConfig, loginWithOffice} from './utils/login';
import {ProcessManager} from './utils/processManager';
import {getPlatformHost} from './utils/platform';
import {getConfig as getCliConfig} from './utils/cli';
import waitOn from 'wait-on';
import 'dotenv/config';
import {Terminal} from './utils/terminal/terminal';
import {cwd} from 'process';
import {join} from 'path/posix';
import {npm} from './utils/npm';
import {MITM_BIN_NAME, resolveBinary} from './utils/mitmproxy';
import {parse} from 'path';
import {npmLogin} from './utils/npmLogin';
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

export default async function () {
  if (!process.env.CI) {
    isMitmProxyInstalled();
    useCIConfigIfEnvIncomplete();
  }
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  process.env.TEST_RUN_ID =
    process.env.TEST_RUN_ID ?? `id${randomBytes(16).toString('hex')}g`;
  process.env.PLATFORM_ENV = process.env.PLATFORM_ENV?.toLowerCase() || '';
  process.env.PLATFORM_HOST = getPlatformHost(process.env.PLATFORM_ENV);

  const uiProjectDir = tmpDirSync();
  process.env.UI_PROJECT_PATH = uiProjectDir.name;

  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();

  if (process.env.CI) {
    let browser;
    try {
      console.log('Starting Chrome');
      await launchChrome({port: 9222, userDataDir: false});
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
    }
  }
}

async function publishPackages() {
  const args = [...npm(), 'run', 'npm:publish:template'];
  await new Terminal(
    args.shift()!,
    args,
    {cwd: join(cwd(), '..', '..')},
    global.processManager!,
    'npmPublish'
  )
    .when('exit')
    .on('process')
    .do()
    .once();
}

async function startVerdaccio() {
  mkdirSync(join('verdaccio', 'verdaccio', 'storage'), {recursive: true});
  const args = [...npm(), 'run', 'verdaccio'];
  new Terminal(
    args.shift()!,
    args,
    {cwd: cwd()},
    global.processManager!,
    'verdaccio'
  );
  await waitOn({resources: ['tcp:4873']});
}

function useCIConfigIfEnvIncomplete() {
  const cliConfig = getCliConfig();
  process.env.PLATFORM_ENV = process.env.PLATFORM_ENV || cliConfig.environment;
  process.env.ORG_ID = process.env.ORG_ID || cliConfig.organization;
  process.env.ACCESS_TOKEN = process.env.ACCESS_TOKEN || cliConfig.accessToken;
}

function isMitmProxyInstalled(): void | never {
  const pathCandidate = resolveBinary(MITM_BIN_NAME);
  try {
    parse(pathCandidate);
  } catch (error) {
    throw 'mitmdump not found in Path. Please install mitmproxy and add its binaries to your path';
  }
}
