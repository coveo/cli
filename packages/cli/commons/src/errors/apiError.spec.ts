import {APIError} from './apiError';

describe('APIError', () => {
  it('should print the tagline', () => {
    expect(() => {
      throw new APIError({}, 'This is a tagline');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not print a tagline', () => {
    expect(() => {
      throw new APIError({});
    }).toThrowErrorMatchingSnapshot();
  });

  describe('when the error is of type APIErrorResponse', () => {
    it.each([
      {
        title: 'it should print the message',
        response: {message: 'something went wrong'},
      },
      {
        title: 'it should print the request Id',
        response: {requestID: '123456qwerty'},
      },
      {
        title: 'it should print the error code',
        response: {errorCode: 'YOU_SHALL_NOT_GET_MODE_INFO'},
      },
      {
        title: 'it should print everything',
        response: {
          errorCode: 'SOME_ERROR',
          message: 'some more info',
          requestID: '123456qwerty',
        },
      },
    ])(`$title`, ({response}) => {
      expect(() => {
        throw new APIError(response, 'This is a tagline');
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
