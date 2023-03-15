import {bold} from 'chalk';
import {ZodError, z} from 'zod';
import {fail, groupEnd, groupStart, log} from './logger';

export function prettifyZodError({errors}: ZodError, indent = true) {
  if (indent) {
    groupStart();
  }

  for (const error of errors) {
    const prefix = bold(`Invalid ${error.path.join('.')}: `);
    if (error.code === z.ZodIssueCode.invalid_union) {
      for (const err of error.unionErrors) {
        prettifyZodError(err, false);
      }
    } else {
      fail(`${prefix}${error.message}`);
    }
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

// function schemaHasDescription(schema: any): schema is Schema {
//   return 'description' in schema;
// }
