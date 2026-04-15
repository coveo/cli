import {CliUx} from '@coveo/cli-commons/compat/oclif';
import isCi from 'is-ci';
import {red, green, magenta} from '@coveo/cli-commons/compat/chalk';
import inquirer from 'inquirer';

function isWindows() {
  return process.platform === 'win32';
}

function isWindowsTerminal() {
  return Boolean(process.env['WT_PROFILE_ID']);
}

export function shouldUseColor() {
  return !isWindows() || isWindowsTerminal();
}

export function startSpinner(task: string, status?: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task, status);
}

export function stopSpinner(options?: {success?: boolean}) {
  if (!CliUx.ux.action.running) {
    return;
  }
  const defaultOptions = {success: true};
  const {success} = {...defaultOptions, ...options};
  const symbol = success ? green('✔') : red.bold('!');
  CliUx.ux.action.stop(`${symbol}`.trimEnd());
}

export const formatOrgId = (orgId: TemplateStringsArray | string) =>
  shouldUseColor() ? magenta(orgId) : orgId;

export const confirm = (message: string, ciDefault: boolean) =>
  isCi ? Promise.resolve(ciDefault) : CliUx.ux.confirm(message);

export const prompt = (message: string, ciDefault: string) =>
  isCi ? Promise.resolve(ciDefault) : CliUx.ux.prompt(message);

export const promptChoices = async (
  message: string,
  choices: any[],
  ciDefault: string
) => {
  if (isCi) {
    return ciDefault;
  }
  const response = await inquirer.prompt([
    {
      name: 'choice',
      message,
      type: 'list',
      choices,
    },
  ]);

  return response.choice;
};
