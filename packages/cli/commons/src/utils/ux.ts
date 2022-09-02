import {CliUx} from '@oclif/core';
import {red, green} from 'chalk';

export function startSpinner(task: string, status?: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task, status);
}

export function stopSpinner(err?: unknown) {
  const defaultErrorMessage = null;
  const isString = (e?: unknown): e is string => typeof e === 'string';
  const isError = (e?: unknown): e is Error => e instanceof Error;

  const message = isString(err)
    ? err
    : isError(err) && err.message
    ? err.message
    : defaultErrorMessage;

  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(message ? red.bold('!') + ` ${message}` : green('✔'));
  }
}
