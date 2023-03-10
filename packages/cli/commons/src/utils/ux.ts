import {CliUx} from '@oclif/core';
import {red, green, magenta} from 'chalk';


functions isWindows() {
  return process.platform === 'win32'
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
