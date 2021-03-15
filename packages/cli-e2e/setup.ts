/* eslint-disable @typescript-eslint/no-namespace */
import {ChildProcessWithoutNullStreams} from 'child_process';
import type {Browser} from 'puppeteer';
import {connectToChromeBrowser} from './utils/browser';
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
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);
  await clearKeychain();
  global.loginProcess = await loginWithOffice();
  await clearChromeBrowsingData(browser);
}
