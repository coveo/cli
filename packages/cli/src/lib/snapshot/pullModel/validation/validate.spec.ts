import {mocked} from 'ts-jest/utils';

jest.mock('jsonschema');
jest.mock('./errors');
const trueErrors = jest.requireActual('./errors');

import {validate, ValidatorResult} from 'jsonschema';
import {validateSnapshotPullModel} from './validate';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';

describe('validate', () => {
  const getFakeValidationError = () => ({
    stack: 'instance.somestuff',
  });
  const mockedValidate = mocked(validate);
  const mockedInvalidSPMError = mocked(InvalidSPMError);
  const mockedUnknownSPMValidationError = mocked(UnknownSPMValidationError);

  const mockValidateReturnValue = (returnValue: unknown) =>
    mockedValidate.mockReturnValue(returnValue as ValidatorResult);

  beforeEach(() => {
    jest.resetAllMocks();
    mockedInvalidSPMError.mockImplementation(
      (...args) => new trueErrors.InvalidSPMError(...args)
    );
    mockedUnknownSPMValidationError.mockImplementation(
      (...args) => new trueErrors.UnknownSPMValidationError(...args)
    );
  });

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
      beforeEach(() => {
        mockValidateReturnValue({
          valid: false,
          errors: [],
        });
      });

      describe('if shouldContactCoveo is true', () => {
        it('should call the ErrorConstructor with true', () => {
          try {
            validateSnapshotPullModel({}, true);
          } catch (error) {
            expect(mockedUnknownSPMValidationError).toHaveBeenCalledWith(true);
          }
        });
      });

      describe('if shouldContactCoveo is false', () => {
        it('should call the ErrorConstructor with false', () => {
          try {
            validateSnapshotPullModel({}, false);
          } catch (error) {
            expect(mockedUnknownSPMValidationError).toHaveBeenCalledWith(false);
          }
        });
      });

      describe('if shouldContactCoveo is unset', () => {
        it('should call the ErrorConstructor with false', () => {
          try {
            validateSnapshotPullModel({}, false);
          } catch (error) {
            expect(mockedUnknownSPMValidationError).toHaveBeenCalledWith(false);
          }
        });
      });

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
          }).toThrow(trueErrors.InvalidSPMError);
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
          }).toThrow(trueErrors.UnknownSPMValidationError);
        });
      });
    });
  });
});
