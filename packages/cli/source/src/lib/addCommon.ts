import {CliUx} from '@oclif/core';
import {red, dim, green} from 'chalk';
import {BuiltInTransformers, errors} from '@coveo/push-api-client';
import {withNormalizeInvalidFields} from './commonFlags';
import {pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';
import dedent from 'ts-dedent';

const allowedCharRegExp = /^[a-z]+[a-z0-9_]*$/;
interface PrintableUnsupportedField {
  original: string;
  normalized: string;
  valid: boolean;
}

export const formatErrorMessage = (err: unknown) => {
  const {UnsupportedFieldError} = errors;
  if (err instanceof UnsupportedFieldError) {
    const normalizations = getNormalizations(err.unsupportedFields);
    const {fixables, unfixables} = colorizeFields(normalizations);
    const isFixable = unfixables.length === 0;

    printInvalidFieldTable(fixables);
    printInvalidFieldTable(unfixables);
    err.message = getFormattedMessage(isFixable);
  }
};

const getFormattedMessage = (isFixable: boolean) => {
  const normalizeFlag = Object.keys(withNormalizeInvalidFields())[0];
  let message = `Run the same command using the \`--${normalizeFlag}\` flag to automatically normalize field names while pushing your data.`;
  if (!isFixable) {
    message = dedent`Cannot normalize some of the invalid field names detected in your data
      Review your data and ensure all field names as shown in the second table have at least one alphabetic character.`;
  }
  return message;
};

const colorizeFields = (fields: PrintableUnsupportedField[]) => {
  const fixables: PrintableUnsupportedField[] = [];
  const unfixables: PrintableUnsupportedField[] = [];
  for (const field of fields) {
    if (field.valid) {
      const normalized = green(field.normalized);
      fixables.push({...field, normalized});
    } else {
      const normalized =
        field.normalized === ''
          ? dim('(empty field name)')
          : red(field.normalized);
      unfixables.push({...field, normalized});
    }
  }
  return {fixables, unfixables};
};

const getNormalizations = (
  unsupportedFields: [string, string][]
): PrintableUnsupportedField[] => {
  return unsupportedFields.map(([original, transformed]) => {
    const normalized = BuiltInTransformers.toLowerCase(transformed);
    return {
      original,
      normalized,
      valid: isFieldNameValid(normalized),
    };
  });
};

const printInvalidFieldTable = (fields: {valid: boolean}[]) => {
  const count = fields.length;
  const pluralized = pluralizeIfNeeded(['field', 'fields'], count);
  if (count === 0) {
    return;
  }

  const fixable = fields[0].valid;
  CliUx.ux.log(
    ` ${count} ${pluralized} detected in your data can${
      fixable ? '' : 'not'
    } be normalized`
  );
  CliUx.ux.table(fields, {
    original: {header: 'Original'},
    normalized: {header: 'Normalized'},
  });
  logNewLine();
};

export const logNewLine = (lines = 1) => {
  for (let i = 0; i < lines; i++) {
    CliUx.ux.log('');
  }
};

const isFieldNameValid = (fieldName: string): boolean => {
  return allowedCharRegExp.test(fieldName.toLowerCase());
};
