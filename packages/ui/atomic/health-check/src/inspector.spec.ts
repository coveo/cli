jest.mock('./logger');

import {Inspector, Assertion} from './inspector';
import {failure, log, success} from './logger';

const mockedSuccess = jest.mocked(success);
const mockedFail = jest.mocked(failure);
const mockedLog = jest.mocked(log);
let mockedExit: jest.SpyInstance;

const doMockProcessExit = () => {
  mockedExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
    throw new Error('process.exit: ' + number);
  });
};
const noopAssertion: Assertion = () => {};
const failedAssertion: Assertion = () => {
  throw 'oups!';
};

describe('Inspector', () => {
  let inspector: Inspector;

  beforeAll(() => {
    doMockProcessExit();
  });

  beforeEach(() => {
    inspector = new Inspector();
  });

  afterAll(() => {
    mockedExit.mockRestore();
  });

  describe('when some assertions are invalid', () => {
    beforeEach(() => {
      inspector
        .check(noopAssertion, 'First assertion')
        .check(failedAssertion, 'Second assertion')
        .check(noopAssertion, 'third assertion');
    });

    it('should log success and fail messages', () => {
      expect(mockedFail).toBeCalledTimes(1);
      expect(mockedSuccess).toBeCalledTimes(2);
    });

    it('should log a report', () => {
      expect(() => {
        inspector.report();
      }).toThrow();
      expect(mockedLog).toBeCalled();
    });

    it('should exit the process', async () => {
      expect(() => {
        inspector.report();
      }).toThrow('process.exit: 1');
      expect(mockedExit).toBeCalledTimes(1);
    });
  });

  describe('when all assertions are valid', () => {
    beforeEach(() => {
      inspector
        .check(noopAssertion, 'First assertion')
        .check(noopAssertion, 'Second assertion')
        .check(noopAssertion, 'third assertion')
        .report();
    });

    it('should only log success messages', () => {
      expect(mockedSuccess).toBeCalledTimes(3);
    });

    it('should not log fail messages', () => {
      expect(mockedFail).not.toBeCalled();
    });

    it('should not print a report', () => {
      expect(mockedLog).not.toBeCalled();
    });

    it('should not exit the process', async () => {
      expect(mockedExit).not.toBeCalled();
    });
  });
});
