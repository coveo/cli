import axios from 'axios';

import {connect} from 'puppeteer-core';
import type {Browser} from 'puppeteer-core';

const CHROME_JSON_DEBUG_URL = 'http://localhost:9222/json/version';

interface JsonVersionFile {
  webSocketDebuggerUrl: string;
}

/**
 * Closes all pages of the targeted browser instance.
 * @param browser targeted browser instance.
 */
export async function closeAllPages(browser: Browser) {
  const pages = await browser.pages();
  const pageClosePromises: Promise<void>[] = [];
  for (const page of pages) {
    pageClosePromises.push(page.close());
  }
  return pageClosePromises;
}

async function getWsUrl(): Promise<string> {
  const chromeDebugInfoRaw = (
    await axios.get<JsonVersionFile>(CHROME_JSON_DEBUG_URL)
  ).data;
  return chromeDebugInfoRaw.webSocketDebuggerUrl;
}

/**
 * Return the browser instance.
 */
export async function getBrowser(): Promise<Browser> {
  const wsURL = await getWsUrl();
  return connect({browserWSEndpoint: wsURL});
}
