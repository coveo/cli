import {deletePassword, getPassword} from 'keytar';
import {userInfo} from 'os';
import {Page, Target} from 'puppeteer-core';
import type {Browser} from 'puppeteer-core';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import {answerPrompt, CLI_EXEC_PATH, isYesNoPrompt} from './cli';

function isLoginPage(page: Page) {
  // TODO: CDX-98: URL should vary in fonction of the targeted environment.
  return page.url().match(/https:\/\/platform.*cloud\.coveo\.com\/login/);
}

export async function isLoggedin() {
  const currentAccount = userInfo().username;
  const accessToken = await getPassword(
    'com.coveo.cli.access.token',
    currentAccount
  );
  return accessToken !== null;
}

function waitForLoginPage(browser: Browser) {
  return new Promise<Page>((resolve) => {
    browser.on('targetchanged', async (target: Target) => {
      const page = await target.page();
      if (page && isLoginPage(page) !== null) {
        resolve(page);
      }
    });
  });
}

async function staySignedIn(page: Page) {
  await page.waitForSelector('input[type="submit"]');
  await page.click('input[type="submit"]');
}

async function possiblyAcceptCustomerAgreement(page: Page) {
  if (page.url().match(/https:\/\/platform.*cloud\.coveo\.com\/eula.?/)) {
    await page.waitForSelector('.coveo-checkbox-label button');
    await page.click('.coveo-checkbox-label button');
    await page.waitForTimeout(200); // wait for the button to be enabled
    await page.waitForSelector('button[type="submit"]');
    await page.click('button[type="submit"]');
  }
}

export function runLoginCommand() {
  const cliProcess = spawn(CLI_EXEC_PATH, ['auth:login', '-e=dev']);
  cliProcess.stderr.on('data', async (data) => {
    if (isYesNoPrompt(data.toString())) {
      await answerPrompt('n', cliProcess);
    }
  });
  cliProcess.stdout.on('data', async (data) => {
    if (isYesNoPrompt(data.toString())) {
      await answerPrompt('n', cliProcess);
    }
  });

  return cliProcess;
}

async function startLoginFlow(browser: Browser) {
  const username = process.env.PLATFORM_USER_NAME;
  const password = process.env.PLATFORM_USER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing login credentials');
  }

  await waitForLoginPage(browser);

  const pages = await browser.pages();
  const page = pages.find((page) => isLoginPage(page));
  if (!page) {
    throw new Error('Unable to find login page');
  }

  await page.waitForSelector('#loginWithOffice365');
  await page.click('#loginWithOffice365');

  await page.waitForNavigation();

  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', username);
  await page.waitForSelector('input[type="submit"]');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(500);

  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', password);
  await page.waitForSelector('input[type="submit"]');
  await page.click('input[type="submit"]');

  await page.waitForTimeout(500);

  await staySignedIn(page);

  await possiblyAcceptCustomerAgreement(page);
}

export async function loginWithOffice(
  browser: Browser,
  cliProcesses: ChildProcessWithoutNullStreams[]
) {
  if (await isLoggedin()) {
    return;
  }

  const loginProcess = runLoginCommand();
  cliProcesses.push(loginProcess);

  await startLoginFlow(browser);
}

export async function logout() {
  const currentAccount = userInfo().username;
  await deletePassword('com.coveo.cli.access.token', currentAccount);
}
