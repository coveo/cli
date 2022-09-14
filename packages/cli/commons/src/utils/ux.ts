import {CliUx} from '@oclif/core';
import {red, green} from 'chalk';

export function starSpinner(task: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task);
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
