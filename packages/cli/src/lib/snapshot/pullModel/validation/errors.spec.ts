import type {ValidationError} from 'jsonschema';
import dedent from 'ts-dedent';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';

describe('SnapshotPullModelErrors', () => {
  describe('UnknownSPMValidationError', () => {
    describe('if shouldContactCoveo is true', () => {
      it('should throw suffixed message', () => {
        const instance = new UnknownSPMValidationError(true);
        expect(instance.message).toBe(dedent`
            An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'.
            This is probably a problem with the Coveo CLI, please report this issue at https://github.com/coveo/cli/issues`);
      });
    });

    describe('if shouldContactCoveo is false', () => {
      it('should throw non-suffixed message', () => {
        const instance = new UnknownSPMValidationError(false);
        expect(instance.message).toBe(
          "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'."
        );
      });
    });
  });

  describe('InvalidSPMError', () => {
    const errors = [{stack: 'instance.test123'}, {stack: 'test456'}];
    const expectedMessageBody = `
 - test123
 - test456`;
    describe('if shouldContactCoveo is true', () => {
      it('should throw suffixed message', () => {
        const instance = new InvalidSPMError(true, errors as ValidationError[]);
        expect(instance.message).toBe(dedent`
            ${expectedMessageBody}
            This is probably a problem with the Coveo CLI, please report this issue at https://github.com/coveo/cli/issues`);
      });
    });

    describe('if shouldContactCoveo is false', () => {
      it('should throw non-suffixed message', () => {
        const instance = new InvalidSPMError(
          false,
          errors as ValidationError[]
        );
        expect(instance.message).toBe(expectedMessageBody);
      });
    });
  });
});
