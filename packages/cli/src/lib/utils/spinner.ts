import {green, red} from 'chalk';
import {CliUx} from '@oclif/core';

export function newTask(task: string) {
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(green('✔'));
  }
  CliUx.ux.action.start(task);
}

export function stopCurrentTask(err?: unknown) {
  const message = err instanceof Error && err.message ? err.message : '';
  if (CliUx.ux.action.running) {
    CliUx.ux.action.stop(err ? red.bold('!') + ` ${message}` : green('✔'));
  }
}
