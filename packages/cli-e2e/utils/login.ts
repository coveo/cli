import retry from 'async-retry';
import {deletePassword, getPassword} from 'keytar';
import {userInfo} from 'os';
import type {Browser, Page, Target} from 'puppeteer';
import {spawn} from 'child_process';
import {answerPrompt, CLI_EXEC_PATH, isYesNoPrompt} from './cli';
import LoginSelectors from './loginSelectors';
import {strictEqual} from 'assert';
import {connectToChromeBrowser} from './browser';
import {isElementClickable} from './browser';

function isLoginPage(page: Page) {
  // TODO: CDX-98: URL should vary in fonction of the targeted environment.
  return page.url() === 'https://platformdev.cloud.coveo.com/login';
}

export async function isLoggedin() {
  const currentAccount = userInfo().username;
  const accessToken = await getPassword(
    'com.coveo.cli.access.token',
    currentAccount
  );
  return Boolean(accessToken);
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
  await page.waitForSelector(LoginSelectors.SubmitInput, {
    visible: true,
  });
  await page.waitForSelector(LoginSelectors.SubmitInput);
  await page.click(LoginSelectors.SubmitInput);
}

async function possiblyAcceptCustomerAgreement(page: Page) {
  // TODO: CDX-98: URL should vary in fonction of the targeted environment.
  if (page.url().startsWith('https://platformdev.cloud.coveo.com/eula')) {
    await page.waitForSelector(LoginSelectors.coveoCheckboxButton);
    await page.click(LoginSelectors.coveoCheckboxButton);
    await page.waitForTimeout(200); // wait for the button to be enabled
    await page.waitForSelector(LoginSelectors.submitButton);
    await page.click(LoginSelectors.submitButton);
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

  await page.waitForSelector(LoginSelectors.loginWithOfficeButton);
  await page.click(LoginSelectors.loginWithOfficeButton);

  await page.waitForNavigation();

  await page.waitForSelector(LoginSelectors.emailInput);
  await page.type(LoginSelectors.emailInput, username);
  await page.waitForSelector(LoginSelectors.SubmitInput);
  await page.click(LoginSelectors.SubmitInput);

  await isElementClickable(page, LoginSelectors.passwordInput);

  await page.waitForSelector(LoginSelectors.passwordInput);
  await page.type(LoginSelectors.passwordInput, password);
  await page.waitForSelector(LoginSelectors.SubmitInput);
  await page.click(LoginSelectors.SubmitInput);

  await staySignedIn(page);

  await possiblyAcceptCustomerAgreement(page);

  await retry(async () => strictEqual(await isLoggedin(), true));

  await page.close();
}

export async function loginWithOffice() {
  if (await isLoggedin()) {
    return;
  }
  const browser: Browser = await connectToChromeBrowser();

  const loginProcess = runLoginCommand();

  await startLoginFlow(browser);
  return loginProcess;
}

export async function clearKeychain() {
  const currentAccount = userInfo().username;
  await deletePassword('com.coveo.cli.access.token', currentAccount);
}
