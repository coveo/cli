import retry from 'async-retry';
import type {Browser, Page, Target} from 'puppeteer';
import {
  answerPrompt,
  CLI_EXEC_PATH,
  getConfigFilePath,
  isGenericYesNoPrompt,
} from './cli';
import LoginSelectors from './loginSelectors';
import {strictEqual} from 'assert';
import {connectToChromeBrowser} from './browser';
import {isElementClickable} from './browser';
import {readJSON, writeJSON, existsSync} from 'fs-extra';
import {Terminal} from './terminal/terminal';

function isLoginPage(page: Page) {
  // TODO: CDX-98: URL should vary in fonction of the targeted environment.
  return page.url() === 'https://platformdev.cloud.coveo.com/login';
}

export async function isLoggedin() {
  if (!existsSync(getConfigFilePath())) {
    return false;
  }
  const cfg = await readJSON(getConfigFilePath());
  return Boolean(cfg.accessToken);
}

function waitForLoginPage(browser: Browser) {
  return new Promise<Page>((resolve) => {
    browser.on('targetchanged', async (target: Target) => {
      const page = await target.page();
      if (page && isLoginPage(page)) {
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
  const loginTerminal = new Terminal(
    CLI_EXEC_PATH,
    ['auth:login', '-e=dev'],
    undefined,
    global.processManager!,
    'initial-login'
  );
  loginTerminal
    .when(isGenericYesNoPrompt)
    .on('stderr')
    .do(answerPrompt('n'))
    .once();

  return loginTerminal;
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

  if ((await browser.pages()).length < 2) {
    await browser.newPage();
  }

  await page.close();
}

export async function loginWithOffice(browser?: Browser) {
  if (await isLoggedin()) {
    return;
  }
  browser = browser ?? (await connectToChromeBrowser());

  const loginProcess = runLoginCommand();

  await startLoginFlow(browser);
  return loginProcess;
}

export async function clearAccessTokenFromConfig() {
  if (!existsSync(getConfigFilePath())) {
    return;
  }
  const cfg = await readJSON(getConfigFilePath());
  delete cfg.accessToken;
  await writeJSON(getConfigFilePath(), cfg);
}
