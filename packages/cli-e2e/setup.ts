/* eslint-disable @typescript-eslint/no-namespace */
import {ChildProcessWithoutNullStreams} from 'child_process';
import {mkdirSync} from 'fs';
import type {Browser} from 'puppeteer';
import {
  captureScreenshots,
  connectToChromeBrowser,
  SCREENSHOTS_PATH,
} from './utils/browser';
import {clearKeychain, loginWithOffice} from './utils/login';

declare global {
  namespace NodeJS {
    interface Global {
      loginProcess: ChildProcessWithoutNullStreams | undefined;
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
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);
  await clearKeychain();
  try {
    global.loginProcess = await loginWithOffice();
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  await clearChromeBrowsingData(browser);
}
