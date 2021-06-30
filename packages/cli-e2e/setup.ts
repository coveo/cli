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
  process.env.GITHUB_ACTION = (
    process.env.GITHUB_ACTION || randomBytes(16).toString('hex')
  )
    .replace(/^_*/g, '') // Remove all `-` prefix
    .replace(/_/g, '-') // Replace all others '_' by a '-'
    .replace(/-*(?=\d)/g, ''); // Remove all '-' followed by a digit.
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);
  await clearAccessTokenFromConfig();
  try {
    global.processManager = new ProcessManager();
    await loginWithOffice(browser);
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  await clearChromeBrowsingData(browser);
}
