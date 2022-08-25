import {stdout} from 'stdout-stderr';
import {BuiltInTransformers, errors} from '@coveo/push-api-client';
import {fancyIt} from '../../__test__/it';
import {formatCliLog} from '../../__test__/jestSnapshotUtils';
import {formatErrorMessage} from './addCommon';

describe('addCommon', () => {
  const fixableFields: [string, string][] = ['0Invalid-Field', 'poster-A'].map(
    (field) => [field, BuiltInTransformers.identity(field)]
  );
  const unfixableFields: [string, string][] = ['', '$_(*&'].map((field) => [
    field,
    BuiltInTransformers.identity(field),
  ]);

  fancyIt()('should let user know possibility of normalization', () => {
    const error = new errors.UnsupportedFieldError(...fixableFields);
    expect(error.message).not.toContain('Cannot normalize');
  });

  fancyIt()('should let user know impossibility of normalization', () => {
    const error = new errors.UnsupportedFieldError(...unfixableFields);
    formatErrorMessage(error);
    expect(error.message).toContain('Cannot normalize');
  });

  fancyIt()('should log fixable fields', () => {
    const error = new errors.UnsupportedFieldError(...fixableFields);
    stdout.start();
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
    stdout.stop();
  });

  fancyIt()('should log unfixable fields', () => {
    const error = new errors.UnsupportedFieldError(...unfixableFields);
    stdout.start();
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
    stdout.stop();
  });

  fancyIt()('should log both fixable and unfixable fields', () => {
    const error = new errors.UnsupportedFieldError(
      ...fixableFields,
      ...unfixableFields
    );
    stdout.start();
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
    stdout.stop();
  });
});
