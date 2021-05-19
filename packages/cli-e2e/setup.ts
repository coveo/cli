/* eslint-disable @typescript-eslint/no-namespace */
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

declare global {
  namespace NodeJS {
    interface Global {
      processManager: ProcessManager | undefined;
    }
  }
}

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
  console.log('entry');
  console.log(`start creating screenshot folder at:${SCREENSHOTS_PATH}`);
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  console.log('screenshot folder created');
  process.env.GITHUB_ACTION =
    process.env.GITHUB_ACTION || randomBytes(16).toString('hex');
  console.log('attempt chrome connection');
  const browser = await connectToChromeBrowser();
  console.log('chrome connection successful');
  console.log('cleaning chrome data');
  await clearChromeBrowsingData(browser);
  console.log('chrome data cleaned');
  console.log('clear user data');
  await clearAccessTokenFromConfig();
  console.log('user data cleared');
  try {
    global.processManager = new ProcessManager();
    console.log('start connecting.');
    await loginWithOffice();
    console.log('connected');
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  console.log('cleaning chrome data');
  await clearChromeBrowsingData(browser);
  console.log('chrome data cleaned');
}
