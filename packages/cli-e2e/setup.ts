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
import {getConfig, getPathToHomedirEnvFile} from './utils/cli';

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
  const {accessToken} = getConfig();
  const testOrgId = await createOrg(orgName, accessToken);
  console.log(`Created org ${testOrgId}`);
  const pathToEnv = getPathToHomedirEnvFile();
  saveToEnvFile(pathToEnv, {
    PLATFORM_ENV: getPlatformEnv(),
    PLATFORM_HOST: getPlatformHost(),
    TEST_RUN_ID: process.env.TEST_RUN_ID,
    TEST_ORG_ID: testOrgId,
    ACCESS_TOKEN: accessToken,
  });
}

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  process.env.TEST_RUN_ID = `id${randomBytes(16).toString('hex')}g`;
  process.env.PLATFORM_ENV = getPlatformEnv();
  process.env.PLATFORM_HOST = getPlatformHost();
  const testOrgName = `cli-e2e-${process.env.TEST_RUN_ID}`;
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);
  await clearAccessTokenFromConfig();
  try {
    global.processManager = new ProcessManager();
    await loginWithOffice(browser);
    await createTestOrgAndSaveOrgIdToEnv(testOrgName);
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  await clearChromeBrowsingData(browser);
}
