import stripAnsi from 'strip-ansi';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {APIError} from './apiError';
import {CLIBaseError} from './cliBaseError';
import {UnknownError} from './unknownError';
import {wrapError} from './wrapError';

describe('wrapError', () => {
  let error: CLIBaseError;

  describe('when the error is a string', () => {
    beforeAll(() => {
      error = wrapError('this is an error');
    });

    fancyIt()('should instanciate a CLIBaseError', () => {
      expect(error).toBeInstanceOf(CLIBaseError);
    });

    fancyIt()('should store the message', () => {
      expect(error.message).toBe('this is an error');
    });
  });

  describe('when the error is coming from the API', () => {
    beforeAll(() => {
      const apiResponse = {
        message: 'Some error message',
        errorCode: 'SOMETHING_WENT_WRONG',
        requestID: 'some id',
      };
      error = wrapError(apiResponse);
    });

    fancyIt()('should instanciate an APIError', () => {
      expect(error).toBeInstanceOf(APIError);
    });

    fancyIt()('should prettify error message from API', () => {
      expect(stripAnsi(error.message)).toMatchSnapshot();
    });
  });

  describe('when the error is already a CLIBaseError', () => {
    const initialError = new CLIBaseError('😱');

    beforeAll(() => {
      error = wrapError(initialError);
    });

    fancyIt()('should return the same CLIBaseError instance', () => {
      expect(error).toBe(error);
    });
  });

  describe('when the error is a generic Error', () => {
    beforeAll(() => {
      const genericError = new Error('sad error 😥');
      error = wrapError(genericError);
    });

    fancyIt()('should instanciate a CLIBaseError', () => {
      expect(error).toBeInstanceOf(CLIBaseError);
    });

    fancyIt()('should persist error message', () => {
      expect(error.message).toBe('sad error 😥');
    });
  });

  describe('when the error is neither of the above', () => {
    const unknownError = {customParameter: 'foo'};

    beforeAll(() => {
      error = wrapError(unknownError);
    });

    fancyIt()('should instanciate an UnknownError', () => {
      expect(error).toBeInstanceOf(UnknownError);
    });
  });
});
