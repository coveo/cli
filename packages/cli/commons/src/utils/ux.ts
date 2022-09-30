import {CliUx} from '@oclif/core';
import {red, green, magenta} from 'chalk';

export function startSpinner(task: string, status?: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task, status);
}

export function stopSpinner(options?: {success?: boolean; message?: string}) {
  if (!CliUx.ux.action.running) {
    return;
  }
  const defaultOptions = {success: true, message: ''};
  const {success, message} = {...defaultOptions, ...options};
  const symbol = success ? green('✔') : red.bold('!');
  CliUx.ux.action.stop(`${symbol} ${message}`.trimEnd());
}

export const formatOrgId = (orgId: TemplateStringsArray | string) =>
  magenta(orgId);
