const CurrentSchemaVersion = 'versionThatTheCliWant';
jest.mock('@oclif/core', () => ({}));
jest.mock('semver');
jest.mock('./config');
jest.mock('./configSchemaVersion', () => ({
  CurrentSchemaVersion,
}));
import {IncompatibleConfigurationError} from './configErrors';
import {coerce, gt, lt, SemVer} from 'semver';
import dedent from 'ts-dedent';
import {fancyIt} from '../../__test__/it';

const mockedCoerce = jest.mocked(coerce);
const mockedLt = jest.mocked(lt);
const mockedGt = jest.mocked(gt);
describe('configErrors', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('IncompatibleConfigurationError', () => {
    describe('when the version is undefined', () => {
      fancyIt()(
        'should have a message saying that no version has been found',
        () => {
          expect(new IncompatibleConfigurationError(undefined).message).toBe(
            'No version found in config'
          );
        }
      );
    });

    describe('when the version is not a string nor undefined', () => {
      fancyIt()(
        'should have a message saying that the version of the found type and that it expected a string',
        () => {
          expect(new IncompatibleConfigurationError(42).message).toBe(
            'Version found in config is a number. Expected a string.'
          );
        }
      );
    });

    describe('when the version is a non-semver-parsable string', () => {
      beforeEach(() => {
        mockedCoerce.mockReturnValueOnce(null);
      });

      fancyIt()(
        'should have a message saying that the version is not parsable',
        () => {
          expect(new IncompatibleConfigurationError('potato').message).toBe(
            "Version found in config 'potato' is not parsable to a valid semantic version."
          );
          expect(mockedCoerce).toBeCalledWith('potato');
        }
      );
    });

    describe('when the version is greater than the supported version', () => {
      const mockedSemverInstance = new SemVer('1.0.0');
      beforeEach(() => {
        mockedCoerce.mockReturnValue(mockedSemverInstance);
        mockedGt.mockReturnValueOnce(true);
      });

      fancyIt()(
        'should have a message saying that the version is greater than the one accepted',
        () => {
          expect(new IncompatibleConfigurationError('potato').message).toBe(
            "Version found in config 'potato' is greater than the one accepted by this version of the CLI."
          );
          expect(mockedGt).toBeCalledWith(
            mockedSemverInstance,
            CurrentSchemaVersion
          );
        }
      );
    });

    describe('when the version is lesser than the supported version', () => {
      const mockedSemverInstance = new SemVer('1.0.0');
      beforeEach(() => {
        mockedCoerce.mockReturnValue(mockedSemverInstance);
        mockedGt.mockReturnValueOnce(false);
        mockedLt.mockReturnValueOnce(true);
      });

      fancyIt()(
        'should have a message saying that the version is lesser than the one accepted',
        () => {
          expect(new IncompatibleConfigurationError('potato').message).toBe(
            "Version found in config 'potato' is less than the one accepted by this version of the CLI."
          );
          expect(mockedLt).toBeCalledWith(
            mockedSemverInstance,
            CurrentSchemaVersion
          );
        }
      );
    });

    describe('when the coerced version is not null, nor greater or lesser than the supported version', () => {
      const mockedSemverInstance = new SemVer('1.0.0');
      beforeEach(() => {
        mockedCoerce.mockReturnValue(mockedSemverInstance);
        mockedGt.mockReturnValueOnce(false);
        mockedLt.mockReturnValueOnce(false);
      });

      fancyIt()(
        'should have a message asking the user to report the issue',
        () => {
          expect(new IncompatibleConfigurationError('potato').message).toBe(
            dedent`
            Unknown config version error:
              - configVersion: potato
              - compatibleVersion: versionThatTheCliWant
            Please report this issue to Coveo.`
          );
        }
      );
    });
  });
});
