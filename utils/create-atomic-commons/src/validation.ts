// Taken from Stencil: https://github.com/ionic-team/stencil/blob/main/src/utils/validation.ts

/**
 * Validates that a component tag meets required naming conventions to be used for a web component
 * @param tag the tag to validate
 * @returns an error message if the tag has an invalid name, undefined if the tag name passes all checks
 */
export const ensureComponentValidity = (tag: string): void | never => {
  const errors: Error[] = [];
  if (tag !== tag.toLowerCase()) {
    errors.push(new Error(`Tag cannot contain upper case characters`));
  }
  if (tag.length === 0) {
    errors.push(new Error(`Received empty tag value`));
  }

  if (tag.includes(' ')) {
    errors.push(new Error(`"${tag}" tag cannot contain a space`));
  }

  if (tag.indexOf(',') > -1) {
    errors.push(new Error(`"${tag}" tag cannot be used for multiple tags`));
  }

  const invalidChars = tag.replace(/\w|-|\s/g, '');
  if (invalidChars !== '') {
    errors.push(
      new Error(`"${tag}" tag contains invalid characters: ${invalidChars}`)
    );
  }

  if (tag.indexOf('-') === -1) {
    errors.push(
      new Error(
        `"${tag}" tag must contain a dash (-) to work as a valid web component`
      )
    );
  }

  if (tag.indexOf('--') > -1) {
    errors.push(
      new Error(
        `"${tag}" tag cannot contain multiple dashes (--) next to each other`
      )
    );
  }

  if (tag.startsWith('-')) {
    errors.push(new Error(`"${tag}" tag cannot start with a dash (-)`));
  }

  if (tag.endsWith('-')) {
    errors.push(new Error(`"${tag}" tag cannot end with a dash (-)`));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'Invalid component tag name');
  }
};
