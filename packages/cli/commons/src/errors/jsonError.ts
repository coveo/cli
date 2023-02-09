import {ValidationError} from 'jsonschema';

export function getPrettyJsonValidationErrors(
  errors: ValidationError[]
): string {
  const stackToPrettyError = (stack: string) =>
    ` - ${stack.replace(/^instance\./, '')}\n`;
  return errors
    .reduce<string>(
      (errors, error) => (errors += stackToPrettyError(error.stack)),
      '\n'
    )
    .replace(/\n$/, '');
}
