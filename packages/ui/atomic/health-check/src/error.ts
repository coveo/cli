import {ValidationError, Schema} from 'jsonschema';
import {fail, groupEnd, groupStart, log} from './logger';

export function prettifyJsonValidationError(error: ValidationError) {
  groupStart();
  const {schema, stack} = error;
  fail(stack.replace(/^instance\./, ''));
  if (schemaHasDescription(schema)) {
    log(`   ${schema.description}`);
  }
  groupEnd();
}

export function prettifyError(error: Error) {
  if ('message' in error) {
    log(error.message);
  }
}

function schemaHasDescription(schema: any): schema is Schema {
  return 'description' in schema;
}
