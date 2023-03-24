import {CoveoPlatformClientError} from '@coveo/platform-client';
import {APIError} from './apiError';

describe('APIError', () => {
  it('should print the tagline', () => {
    expect(() => {
      throw new APIError(new CoveoPlatformClientError(), 'This is a tagline');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not print a tagline', () => {
    expect(() => {
      throw new APIError(new CoveoPlatformClientError());
    }).toThrowErrorMatchingSnapshot();
  });

  describe('when the error is of type APIErrorResponse', () => {
    it.each([
      {
        title: 'it should print the details',
        response: () => {
          const err = new CoveoPlatformClientError();
          err.detail = 'something went wrong';
          return err;
        },
      },
      {
        title: 'it should print the request Id',
        response: () => {
          const err = new CoveoPlatformClientError();
          err.xRequestId = '123456qwerty';
          return err;
        },
      },
      {
        title: 'it should print the error code',
        response: () => {
          const err = new CoveoPlatformClientError();
          err.title = 'YOU_SHALL_NOT_GET_MODE_INFO';
          return err;
        },
      },
      {
        title: 'it should print everything',
        response: () => {
          const err = new CoveoPlatformClientError();
          err.xRequestId = '123456qwerty';
          err.title = 'YOU_SHALL_NOT_GET_MODE_INFO';
          err.detail = 'something went wrong';
          return err;
        },
      },
    ])(`$title`, ({response}) => {
      expect(() => {
        throw new APIError(response(), 'This is a tagline');
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
