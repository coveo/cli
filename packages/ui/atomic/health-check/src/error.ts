import {ValidationError} from 'jsonschema';

export function prettifyJsonValidationError(errors: ValidationError): void {
  //   console.log(errors[0] instanceof ValidationError);
  const stackToPrettyError = (stack: string) =>
    ` - ${stack.replace(/^instance\./, '')}\n`;
  //   TODO:  print description
  console.log('TODO: no return');
  return errors
    .reduce<string>(
      (errors, error) => (errors += stackToPrettyError(error.stack)),
      '\n'
    )
    .replace(/\n$/, '');
}

export function prettifyError(error: Error): void {
  console.log('TODO:');
}
