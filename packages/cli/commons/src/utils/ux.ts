import {ux} from '@oclif/core';
import isCi from 'is-ci';
import {red, green, magenta} from 'chalk';

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
  if (ux.action.running) {
    ux.action.stop(green('✔'));
  }
  ux.action.start(task, status);
}

export function stopSpinner(options?: {success?: boolean}) {
  if (!ux.action.running) {
    return;
  }
  const defaultOptions = {success: true};
  const {success} = {...defaultOptions, ...options};
  const symbol = success ? green('✔') : red.bold('!');
  ux.action.stop(`${symbol}`.trimEnd());
}

export const formatOrgId = (orgId: TemplateStringsArray | string) =>
  shouldUseColor() ? magenta(orgId) : orgId;

export const confirm = (message: string, ciDefault: boolean) =>
  isCi ? Promise.resolve(ciDefault) : ux.confirm(message);
