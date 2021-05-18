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
  const client = await browser.target().createCDPSession();

  const browserClearDataPromises = [
    client.send('Network.clearBrowserCookies'),
    client.send('Network.clearBrowserCache'),
  ];

  return Promise.all(browserClearDataPromises);
}

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  process.env.GITHUB_ACTION =
    process.env.GITHUB_ACTION || randomBytes(16).toString('hex');
  const browser = await connectToChromeBrowser();
  await clearChromeBrowsingData(browser);
  await clearAccessTokenFromConfig();
  try {
    global.processManager = new ProcessManager();
    await loginWithOffice();
  } catch (e) {
    await captureScreenshots(browser, 'jestSetup');
    throw e;
  }
  await clearChromeBrowsingData(browser);
}
