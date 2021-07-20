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

async function getLoginPage(browser: Browser) {
  const page = (await browser.pages()).find(isLoginPage);
  if (page) {
    return page;
  }
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
  await page.click(LoginSelectors.SubmitInput);
}

async function possiblyAcceptCustomerAgreement(page: Page) {
  // TODO: CDX-98: URL should vary in fonction of the targeted environment.
  if (page.url().startsWith('https://platformdev.cloud.coveo.com/eula')) {
    await page.waitForSelector(LoginSelectors.coveoCheckboxButton, {
      visible: true,
    });
    await page.click(LoginSelectors.coveoCheckboxButton);
    await page.waitForTimeout(200); // wait for the button to be enabled
    await page.waitForSelector(LoginSelectors.submitButton, {
      visible: true,
    });
    await page.click(LoginSelectors.submitButton);
  }
}

export function runLoginCommand(orgId: string) {
  const args: string[] = [CLI_EXEC_PATH, 'auth:login', '-e=dev', `-o=${orgId}`];
  if (process.platform === 'win32') {
    args.unshift('node');
  }
  const loginTerminal = new Terminal(
    args.shift()!,
    args,
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

  const page = await getLoginPage(browser);

  await page.waitForSelector(LoginSelectors.loginWithOfficeButton, {
    visible: true,
  });
  await page.click(LoginSelectors.loginWithOfficeButton);

  await page.waitForNavigation();

  await page.waitForSelector(LoginSelectors.emailInput, {
    visible: true,
  });
  await page.type(LoginSelectors.emailInput, username);
  await page.waitForSelector(LoginSelectors.SubmitInput, {
    visible: true,
  });
  await page.click(LoginSelectors.SubmitInput);

  await isElementClickable(page, LoginSelectors.passwordInput);

  await page.waitForSelector(LoginSelectors.passwordInput, {
    visible: true,
  });
  await page.type(LoginSelectors.passwordInput, password);
  await page.waitForSelector(LoginSelectors.SubmitInput, {
    visible: true,
  });
  await page.click(LoginSelectors.SubmitInput);

  await staySignedIn(page);

  await possiblyAcceptCustomerAgreement(page);

  await retry(async () => strictEqual(await isLoggedin(), true));

  if ((await browser.pages()).length < 2) {
    await browser.newPage();
  }

  await page.close();
}

export async function loginWithOffice(browser: Browser) {
  const orgId = process.env.ORG_ID;
  if (!orgId) {
    throw new Error('Missing organization ID');
  }
  if (await isLoggedin()) {
    return;
  }

  const loginProcess = runLoginCommand(orgId);

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
