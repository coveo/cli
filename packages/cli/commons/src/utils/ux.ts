import {CliUx} from '@oclif/core';
import {red, green} from 'chalk';

export function starSpinner(task: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task);
}

export function stopSpinner(err?: Error) {
  const message = err instanceof Error && err.message ? err.message : '';
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(err ? red.bold('!') + ` ${message}` : green('✔'));
  }
}
