jest.mock('../../lib/config/config');

import type {IConfig} from '@oclif/config';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import check from './session';

describe('session', () => {
  const mockedConfig = mocked(Config, true);
  const mockedConfigGet = jest.fn();
  const mockedConfigSet = jest.fn();
  const theDate = new Date('1997-08-29T12:00:00Z');
  const dummySessionId = 1234567;

  const doMockConfig = () => {
    mockedConfig.prototype.get = mockedConfigGet;
    mockedConfig.prototype.set = mockedConfigSet;
  };

  const freezeTime = () => {
    jest.useFakeTimers().setSystemTime(theDate.getTime());
  };

  const getTimeBefore = (minutes: number) => {
    return theDate.getTime() - minutes * 60e3;
  };

  beforeAll(() => {
    freezeTime();
    global.config = {configDir: 'the_config_dir'} as IConfig;
  });

  beforeEach(() => {
    doMockConfig();
  });

  afterEach(() => {
    mockedConfig.mockClear();
    mockedConfigGet.mockClear();
  });

  it('should always persist the session id', () => {
    check();
    expect(mockedConfigSet).toHaveBeenNthCalledWith(
      1,
      'amplitudeSession',
      expect.anything()
    );
  });

  it('should always save the time of the last event fired', () => {
    check();
    expect(mockedConfigSet).toHaveBeenNthCalledWith(
      2,
      'lastEventLoggedTime',
      theDate.getTime()
    );
  });

  describe('when the session is undefined', () => {
    it('should generate a new session id', () => {
      mockedConfigGet.mockReturnValue({});
      check();

      expect(mockedConfigSet).toHaveBeenNthCalledWith(
        1,
        'amplitudeSession',
        theDate.getTime()
      );
    });
  });

  describe.each([
    ['has timed out', 'save a new session id', 31, theDate.getTime()],
    ['is still valid', 'use the current session id', 5, dummySessionId],
  ])(
    'when the session %s',
    (
      _: unknown,
      message: string,
      minutesInThePast: number,
      expectedSession: number
    ) => {
      it(`should ${message}`, () => {
        mockedConfigGet.mockReturnValue({
          lastEventLoggedTime: getTimeBefore(minutesInThePast),
          amplitudeSession: dummySessionId,
        });
        check();

        expect(mockedConfigSet).toHaveBeenNthCalledWith(
          1,
          'amplitudeSession',
          expectedSession
        );
      });
    }
  );

  describe('when the session is still valid ', () => {
    it('should return a new session id', () => {
      const lastEventLoggedTime = getTimeBefore(5);
      const previousSession = 1234567;
      mockedConfigGet.mockReturnValue({
        lastEventLoggedTime,
        amplitudeSession: previousSession,
      });
      check();

      expect(mockedConfigSet).toHaveBeenNthCalledWith(
        1,
        'amplitudeSession',
        previousSession
      );
    });
  });
});
