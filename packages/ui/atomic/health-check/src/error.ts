import chalk from './chalk.js';
import {ZodError} from 'zod';
import {failure, groupEnd, groupStart, log} from './logger.js';

export function prettifyZodError(error: ZodError, indent = true) {
  if (indent) {
    groupStart();
  }

  for (const issue of error.issues) {
    const prefix = chalk.bold(`Invalid ${issue.path.join('.')}: `);
    failure(`${prefix}${issue.message}`);
  }

  if (indent) {
    groupEnd();
  }
}

export function prettifyError(error: any) {
  if ('message' in error) {
    log(error.message);
  }
}
