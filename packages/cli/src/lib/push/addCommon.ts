import {CliUx} from '@oclif/core';
import {red, dim, green} from 'chalk';
import {BuiltInTransformers, errors} from '@coveo/push-api-client';
import {normalizeInvalidFields} from '../flags/sourceCommonFlags';
import {pluralizeIfNeeded} from '../utils/string';
import dedent from 'ts-dedent';

const allowedCharRegExp = new RegExp('^[a-z]+[a-z0-9_]*$');

export const handleAddError = (err: unknown) => {
  const {UnsupportedFieldError} = errors;
  if (err instanceof UnsupportedFieldError) {
    CliUx.ux.error('Invalid field name detected while parsing your data.', {
      exit: false,
    });
    const normalizations = err.unsupportedFields.map(
      ([original, transformed]) => {
        const normalized = BuiltInTransformers.toLowerCase(transformed);
        return {
          original,
          normalized,
          valid: isFieldNameValid(normalized),
        };
      }
    );

    const fixable = normalizations
      .filter(({valid}) => valid)
      .map((field) => {
        field.normalized = green(field.normalized);
        return field;
      });

    const unfixable = normalizations
      .filter(({valid}) => !valid)
      .map((field) => {
        const normalized =
          field.normalized === ''
            ? dim('(empty field name)')
            : red(field.normalized);
        field.normalized = normalized;
        return field;
      });

    printInvalidFieldTable(fixable);
    printInvalidFieldTable(unfixable);

    const normalizeFlag = Object.keys(normalizeInvalidFields())[0];
    let message = `Run the same command using the \`--${normalizeFlag}\` flag to automatically normalize field names while pushing your data.`;
    if (unfixable.length > 0) {
      message = dedent`Cannot normalize some of the invalid field names detected in your data
      Review your data and ensure all field names as shown in the second table have at least one alphabetic character.`;
    }
    logNewLine(2);
    CliUx.ux.error(message, {exit: false});
    logNewLine();
  }
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

export const isFieldNameValid = (fieldName: string): boolean => {
  return allowedCharRegExp.test(fieldName.toLowerCase());
};
