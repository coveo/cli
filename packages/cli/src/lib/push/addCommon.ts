import {CliUx} from '@oclif/core';
import {red, dim, green} from 'chalk';
import {BuiltInTransformers, errors} from '@coveo/push-api-client';
import {normalizeInvalidFields} from '../flags/sourceCommonFlags';
import {pluralizeIfNeeded} from '../utils/string';
import dedent from 'ts-dedent';

const allowedCharRegExp = new RegExp('^[a-z]+[a-z0-9_]*$');
interface PrintableUnsupportedField {
  original: string;
  normalized: string;
  valid: boolean;
}

export const handleAddError = (err: unknown) => {
  const {UnsupportedFieldError} = errors;
  if (err instanceof UnsupportedFieldError) {
    CliUx.ux.error('Invalid field name detected while parsing your data.', {
      exit: false,
    });
    const normalizations = getNormalizations(err.unsupportedFields);
    const fixables = normalizations.flatMap(colorizeFixableField);
    const unfixables = normalizations.flatMap(colorizeUnFixableField);
    const isFixable = unfixables.length === 0;

    printInvalidFieldTable(fixables);
    printInvalidFieldTable(unfixables);
    printErrorMessage(isFixable);
  }
};

const printErrorMessage = (isFixable: boolean) => {
  const normalizeFlag = Object.keys(normalizeInvalidFields())[0];
  let message = `Run the same command using the \`--${normalizeFlag}\` flag to automatically normalize field names while pushing your data.`;
  if (!isFixable) {
    message = dedent`Cannot normalize some of the invalid field names detected in your data
      Review your data and ensure all field names as shown in the second table have at least one alphabetic character.`;
  }
  logNewLine(2);
  CliUx.ux.error(message, {exit: false});
  logNewLine();
};

const colorizeFixableField = (
  field: PrintableUnsupportedField
): PrintableUnsupportedField | [] => {
  return field.valid ? {...field, normalized: green(field.normalized)} : [];
};

const colorizeUnFixableField = (
  field: PrintableUnsupportedField
): PrintableUnsupportedField | [] => {
  const normalized =
    field.normalized === '' ? dim('(empty field name)') : red(field.normalized);
  return !field.valid ? {...field, normalized} : [];
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
  logNewLine();
  CliUx.ux.log(
    ` ${count} ${pluralized} detected in your data can${
      fixable ? '' : 'not'
    } be normalized`
  );
  CliUx.ux.table(fields, {
    original: {header: 'Original'},
    normalized: {header: 'Normalized'},
  });
};

const logNewLine = (lines = 1) => {
  CliUx.ux.log(new Array(lines).fill('\n').join(''));
};

const isFieldNameValid = (fieldName: string): boolean => {
  return allowedCharRegExp.test(fieldName.toLowerCase());
};
