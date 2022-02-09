import {mkdirSync} from 'fs';
import {randomBytes} from 'crypto';
import type {Browser} from 'puppeteer';
import {
  captureScreenshots,
  connectToChromeBrowser,
  SCREENSHOTS_PATH,
} from './utils/browser';
import {clearAccessTokenFromConfig, loginWithOffice} from './utils/login';
import {ProcessManager} from './utils/processManager';
import {saveToEnvFile} from './utils/file';
import {createOrg} from './utils/platform';
import {getConfig as getCliConfig, getEnvFilePath} from './utils/cli';
import {launch} from 'chrome-launcher';
import waitOn from 'wait-on';
import 'dotenv/config';
import {Terminal} from './utils/terminal/terminal';
import {cwd} from 'process';
import {join} from 'path/posix';
import {npm} from './utils/windows';
import {MITM_BIN_NAME, resolveBinary} from './utils/mitmproxy';
import {parse} from 'path';
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

function getPlatformEnv() {
  return process.env.PLATFORM_ENV?.toLowerCase();
}

function getPlatformHost() {
  const env = getPlatformEnv();
  return `https://platform${env === 'prod' ? '' : env}.cloud.coveo.com`;
}

async function createTestOrgAndSaveOrgIdToEnv(orgName: string) {
  const {accessToken} = getCliConfig();
  const testOrgId = await createOrg(orgName, accessToken);
  console.log(`Created org ${testOrgId}`);
  const pathToEnv = getEnvFilePath();
  saveToEnvFile(pathToEnv, {
    PLATFORM_ENV: getPlatformEnv(),
    PLATFORM_HOST: getPlatformHost(),
    TEST_RUN_ID: process.env.TEST_RUN_ID,
    TEST_ORG_ID: testOrgId,
    ACCESS_TOKEN: accessToken,
  });
}

export default async function () {
  if (!process.env.CI) {
    isMitmProxyInstalled();
    useCIConfigIfEnvIncomplete();
  }
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  process.env.TEST_RUN_ID = `id${randomBytes(16).toString('hex')}g`;
  process.env.PLATFORM_ENV = getPlatformEnv();
  process.env.PLATFORM_HOST = getPlatformHost();
  const testOrgName = `cli-e2e-${process.env.TEST_RUN_ID}`;
  const chrome = await launch({port: 9222});
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);

  try {
    global.processManager = new ProcessManager();
    await startVerdaccio();
    await publishPackages();

    if (process.env.CI) {
      await clearAccessTokenFromConfig();
      await loginWithOffice(browser);
    } else {
      // TODO: Ensure user is connected
    }
    await createTestOrgAndSaveOrgIdToEnv(testOrgName);
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  await clearChromeBrowsingData(browser);
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

const appendCmdIfWindows = (cmd): string =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

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
