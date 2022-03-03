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
import {readJSON, writeJSON, existsSync} from 'fs-extra';
import {Terminal} from './terminal/terminal';

function isLoginPage(page: Page) {
  const loginUrl = new URL('/login', process.env.PLATFORM_HOST);
  return page.url() === loginUrl.href;
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
  await Promise.all([
    page.click(LoginSelectors.SubmitInput),
    page.waitForNavigation(),
  ]);
}

async function possiblyAcceptCustomerAgreement(page: Page) {
  const customerAgreementUrl = new URL('/eula', process.env.PLATFORM_HOST);
  if (page.url().startsWith(customerAgreementUrl.href)) {
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

export function runLoginCommand(orgId: string, env: string) {
  const args: string[] = [
    CLI_EXEC_PATH,
    'auth:login',
    `-e=${env}`,
    `-o=${orgId}`,
  ];
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

  await Promise.all([
    page.click(LoginSelectors.loginWithOfficeButton),
    page.waitForNavigation({waitUntil: 'networkidle2'}),
    page.waitForSelector(LoginSelectors.emailView),
  ]);

  await page.waitForSelector(LoginSelectors.emailInput, {
    visible: true,
  });
  await page.type(LoginSelectors.emailInput, username);
  await page.waitForSelector(LoginSelectors.SubmitInput, {
    visible: true,
  });
  await Promise.all([
    page.click(LoginSelectors.SubmitInput),
    page.waitForSelector(LoginSelectors.passwordView),
  ]);

  await page.waitForSelector(LoginSelectors.passwordInput, {
    visible: true,
  });
  await page.type(LoginSelectors.passwordInput, password);
  await page.waitForSelector(LoginSelectors.SubmitInput, {
    visible: true,
  });
  await Promise.all([
    page.click(`${LoginSelectors.passwordView} ${LoginSelectors.SubmitInput}`),
    page.waitForNavigation({waitUntil: 'networkidle2', timeout: 2 * 60e3}),
  ]);

  await staySignedIn(page);

  await possiblyAcceptCustomerAgreement(page);

  await retry(async () => strictEqual(await isLoggedin(), true));

  if ((await browser.pages()).length < 2) {
    await browser.newPage();
  }

  await page.close();
}

export async function loginWithOffice(browser: Browser) {
  const {ORG_ID: orgId, PLATFORM_ENV: env} = process.env;
  if (!orgId) {
    throw new Error('Missing organization ID');
  }
  if (!env) {
    throw new Error('Missing platform environment');
  }
  if (await isLoggedin()) {
    return;
  }

  const loginProcess = runLoginCommand(orgId, env);

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

export async function loginWithApiKey(
  apiKey: string,
  orgId: string,
  env: string
) {
  if (!existsSync(getConfigFilePath())) {
    throw 'Missing config file';
  }
  const cfg = await readJSON(getConfigFilePath());
  cfg.accessToken = apiKey;
  cfg.organization = orgId;
  cfg.environment = env;
  cfg.analyticsEnabled = false;
  cfg.anonymous = true;
  await writeJSON(getConfigFilePath(), cfg);
}
