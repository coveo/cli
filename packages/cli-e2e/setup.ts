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
  process.stdout.write('entry');
  process.stdout.write(
    `start creating screenshot folder at:${SCREENSHOTS_PATH}`
  );
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  process.stdout.write('screenshot folder created');
  process.env.GITHUB_ACTION =
    process.env.GITHUB_ACTION || randomBytes(16).toString('hex');
  process.stdout.write('attempt chrome connection');
  const browser = await connectToChromeBrowser();
  process.stdout.write('chrome connection successful');
  process.stdout.write('cleaning chrome data');
  await clearChromeBrowsingData(browser);
  process.stdout.write('chrome data cleaned');
  process.stdout.write('clear user data');
  await clearAccessTokenFromConfig();
  process.stdout.write('user data cleared');
  try {
    global.processManager = new ProcessManager();
    process.stdout.write('start connecting.');
    await loginWithOffice();
    process.stdout.write('connected');
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  process.stdout.write('cleaning chrome data');
  await clearChromeBrowsingData(browser);
  process.stdout.write('chrome data cleaned');
}
