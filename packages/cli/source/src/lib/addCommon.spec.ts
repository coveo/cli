import {stdout} from 'stdout-stderr';
import {BuiltInTransformers, errors} from '@coveo/push-api-client';
import {formatCliLog} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';
import {formatErrorMessage} from './addCommon';

describe('addCommon', () => {
  const fixableFields: [string, string][] = ['0Invalid-Field', 'poster-A'].map(
    (field) => [field, BuiltInTransformers.identity(field)]
  );
  const unfixableFields: [string, string][] = ['', '$_(*&'].map((field) => [
    field,
    BuiltInTransformers.identity(field),
  ]);

  beforeEach(() => {
    stdout.start();
  });

  afterEach(() => {
    stdout.stop();
  });

  it('should let user know possibility of normalization', () => {
    const error = new errors.UnsupportedFieldError(...fixableFields);
    expect(error.message).not.toContain('Cannot normalize');
  });

  it('should let user know impossibility of normalization', () => {
    const error = new errors.UnsupportedFieldError(...unfixableFields);
    formatErrorMessage(error);
    expect(error.message).toContain('Cannot normalize');
  });

  it('should log fixable fields', () => {
    const error = new errors.UnsupportedFieldError(...fixableFields);
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
  });

  it('should log unfixable fields', () => {
    const error = new errors.UnsupportedFieldError(...unfixableFields);
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
  });

  it('should log both fixable and unfixable fields', () => {
    const error = new errors.UnsupportedFieldError(
      ...fixableFields,
      ...unfixableFields
    );
    formatErrorMessage(error);
    expect(formatCliLog(stdout.output)).toMatchSnapshot();
  });
});
