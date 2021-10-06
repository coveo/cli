import {mocked} from 'ts-jest/utils';

jest.mock('jsonschema');
import {validate, ValidatorResult} from 'jsonschema';
import {validateSnapshotPullModel} from './validate';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';

describe('validate', () => {
  const getFakeValidationError = () => ({
    stack: 'instance.somestuff',
  });

  const mockedValidate = mocked(validate);
  const mockValidateReturnValue = (returnValue: unknown) =>
    mockedValidate.mockReturnValue(returnValue as ValidatorResult);

  describe('#validateSnapshotPullModel', () => {
    describe('when the templateJSON is valid', () => {
      beforeEach(() => {
        mockValidateReturnValue({valid: true});
      });

      it('should return true', () => {
        expect(validateSnapshotPullModel({})).toBe(true);
      });
    });

    describe('when the templateJSON is not valid', () => {
      describe('if there is validation errors', () => {
        beforeEach(() => {
          mockValidateReturnValue({
            valid: false,
            errors: [getFakeValidationError()],
          });
        });

        it('should throw a InvalidSPMError', () => {
          expect(() => {
            validateSnapshotPullModel({});
          }).toThrow(InvalidSPMError);
        });
      });

      describe('if there is no validation errors', () => {
        beforeEach(() => {
          mockValidateReturnValue({
            valid: false,
            errors: [],
          });
        });

        it('should throw a UnknownSPMValidationError', () => {
          expect(() => {
            validateSnapshotPullModel({});
          }).toThrow(UnknownSPMValidationError);
        });
      });
    });
  });
});
