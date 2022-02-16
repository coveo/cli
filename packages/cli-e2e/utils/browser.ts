/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {resolve} from 'path';

import puppeteer from 'puppeteer';
import type {Browser, Page} from 'puppeteer';
const CHROME_JSON_DEBUG_URL = 'http://localhost:9222/json/version';

interface JsonVersionFile {
  webSocketDebuggerUrl: string;
}

export const LOGS_PATH = resolve(__dirname, '..', 'artifacts/logs');
export const SCREENSHOTS_PATH = resolve(
  __dirname,
  '..',
  'artifacts/screenshots'
);

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

function getChromeDefaultOptions() {
  return ['--no-first-run', '--window-size=1080,720'];
}
/**
 * Return the browser instance.
 */
export async function connectToChromeBrowser(): Promise<Browser> {
  const wsURL = await getWsUrl();
  return puppeteer.connect({browserWSEndpoint: wsURL});
}

export async function getNewBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true,
    args: getChromeDefaultOptions(),
  });
}

export async function openNewPage(browser: Browser, page?: Page | undefined) {
  const newPage = await browser.newPage();
  if (page) {
    await page.close();
  }
  return newPage;
}

export async function captureScreenshots(
  browser: Browser,
  screenshotName?: string
): Promise<void> {
  let pageCount = 0;
  for (const page of await browser.pages()) {
    page.url();
    try {
      await page.screenshot({
        fullPage: true,
        type: 'png',
        path: resolve(
          SCREENSHOTS_PATH,
          (screenshotName ??
            expect.getState().currentTestName.trim().replace(/\W/g, '_')) +
            `-${pageCount++}.png`
        ),
      });
    } catch (error) {
      console.warn('Failed to record screenshot.');
      console.warn(error);
    }
  }
}

/**
 * Check if an element is within the viewport or is overlapped by another element or disabled
 * For original source code https://github.com/webdriverio/webdriverio/blob/af968a2bbc2d130d8a63229a8edc4974e92e78c3/packages/webdriverio/src/scripts/isElementClickable.ts
 *
 * @param {Page} page       Puppeteer page to use
 * @param {string} selector Selector to check
 */
export async function isElementClickable(page: Page, selector: string) {
  await page.waitForFunction(
    (sel: string) => {
      const elem = document.querySelector(sel);
      if (
        !elem ||
        !elem.getBoundingClientRect ||
        !elem.scrollIntoView ||
        !elem.contains ||
        !elem.getClientRects ||
        !document.elementFromPoint
      ) {
        return false;
      }

      // Edge before switching to Chromium
      const isOldEdge = !!(window as any).StyleMedia;
      // returns true for Chrome and Firefox and false for Safari, Edge and IE
      const scrollIntoViewFullSupport = !((window as any).safari || isOldEdge);

      // get overlapping element
      function getOverlappingElement(elem: HTMLElement, context?: Document) {
        context = context || document;
        const elemDimension = elem.getBoundingClientRect();
        const x = elemDimension.left + elem.clientWidth / 2;
        const y = elemDimension.top + elem.clientHeight / 2;
        return context.elementFromPoint(x, y);
      }

      // get overlapping element rects (currently only the first)
      // applicable if element's text is multiline.
      function getOverlappingRects(elem: HTMLElement, context?: Document) {
        context = context || document;
        const elems = [];

        const rects = elem.getClientRects();
        // webdriver clicks on center of the first element's rect (line of text), it might change in future
        const rect = rects[0];
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        elems.push(context.elementFromPoint(x, y));

        return elems;
      }

      // get overlapping elements
      function getOverlappingElements(elem: HTMLElement, context?: Document) {
        return [getOverlappingElement(elem, context)].concat(
          getOverlappingRects(elem, context)
        );
      }

      // is a node a descendant of a given node
      function nodeContains(elem: HTMLElement, otherNode: HTMLElement) {
        // Edge doesn't support neither Shadow Dom nor contains if ShadowRoot polyfill is used
        if (isOldEdge) {
          let tmpElement = otherNode as HTMLElement | ShadowRoot | Element;
          while (tmpElement) {
            if (tmpElement === elem) {
              return true;
            }

            tmpElement = tmpElement.parentNode as ShadowRoot;
            // DocumentFragment / ShadowRoot polyfill like ShadyRoot
            if (tmpElement && tmpElement.nodeType === 11 && tmpElement.host) {
              tmpElement = tmpElement.host;
            }
          }
          return false;
        }

        return elem.contains(otherNode);
      }

      // is one of overlapping elements the `elem` or one of its child
      function isOverlappingElementMatch(
        elementsFromPoint: HTMLElement[],
        elem: HTMLElement
      ): boolean {
        if (
          elementsFromPoint.some((elementFromPoint) => {
            return (
              elementFromPoint === elem || nodeContains(elem, elementFromPoint)
            );
          })
        ) {
          return true;
        }

        // shadow root
        // filter unique elements with shadowRoot
        let elemsWithShadowRoot = ([] as HTMLElement[]).concat(
          elementsFromPoint
        );
        elemsWithShadowRoot = elemsWithShadowRoot.filter((x: HTMLElement) => {
          return x && x.shadowRoot && (x.shadowRoot as any).elementFromPoint;
        });

        // getOverlappingElements of every element with shadowRoot
        let shadowElementsFromPoint: HTMLElement[] = [];
        for (const shadowElement of elemsWithShadowRoot) {
          shadowElementsFromPoint = shadowElementsFromPoint.concat(
            getOverlappingElements(
              elem,
              (shadowElement as HTMLElement).shadowRoot as any
            ) as any
          );
        }
        // remove duplicates and parents
        shadowElementsFromPoint = ([] as HTMLElement[]).concat(
          shadowElementsFromPoint
        );
        shadowElementsFromPoint = shadowElementsFromPoint.filter((x) => {
          return !elementsFromPoint.includes(x);
        });

        if (shadowElementsFromPoint.length === 0) {
          return false;
        }

        return isOverlappingElementMatch(shadowElementsFromPoint, elem);
      }

      // copied from `isElementInViewport.js`
      function isElementInViewport(elem: HTMLElement) {
        if (!elem.getBoundingClientRect) {
          return false;
        }

        const rect = elem.getBoundingClientRect();

        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const windowWidth =
          window.innerWidth || document.documentElement.clientWidth;

        const vertInView =
          rect.top <= windowHeight && rect.top + rect.height > 0;
        const horInView =
          rect.left <= windowWidth && rect.left + rect.width > 0;

        return vertInView && horInView;
      }

      function isClickable(elem: any) {
        return (
          isElementInViewport(elem) &&
          elem.disabled !== true &&
          isOverlappingElementMatch(
            getOverlappingElements(elem) as any as HTMLElement[],
            elem
          )
        );
      }

      // scroll to the element if it's not clickable
      if (!isClickable(elem)) {
        // works well in dialogs, but the element may be still overlapped by some sticky header/footer
        elem.scrollIntoView(
          scrollIntoViewFullSupport
            ? {block: 'nearest', inline: 'nearest'}
            : false
        );

        // if element is still not clickable take another scroll attempt
        if (!isClickable(elem)) {
          // scroll to element, try put it in the screen center.
          // Should definitely work even if element was covered with sticky header/footer
          elem.scrollIntoView(
            scrollIntoViewFullSupport
              ? {block: 'center', inline: 'center'}
              : true
          );

          return isClickable(elem);
        }
      }

      return true;
    },
    {},
    selector
  );
}
