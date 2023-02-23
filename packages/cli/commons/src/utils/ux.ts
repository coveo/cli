import {ux as cli} from '@oclif/core';
import {red, green, magenta} from 'chalk';

export function startSpinner(task: string, status?: string) {
  if (cli.action.running) {
    cli.action.stop(green('✔'));
  }
  cli.action.start(task, status);
}

export function stopSpinner(options?: {success?: boolean}) {
  if (!cli.action.running) {
    return;
  }
  const defaultOptions = {success: true};
  const {success} = {...defaultOptions, ...options};
  const symbol = success ? green('✔') : red.bold('!');
  cli.action.stop(`${symbol}`.trimEnd());
}

export const formatOrgId = (orgId: TemplateStringsArray | string) =>
  magenta(orgId);
