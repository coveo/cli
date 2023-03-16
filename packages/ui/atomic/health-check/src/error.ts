import {bold} from 'chalk';
import {ZodError} from 'zod';
import {failure, groupEnd, groupStart, log} from './logger.js';

export function prettifyZodError({errors}: ZodError, indent = true) {
  if (indent) {
    groupStart();
  }

  for (const error of errors) {
    const prefix = bold(`Invalid ${error.path.join('.')}: `);
    failure(`${prefix}${error.message}`);
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
