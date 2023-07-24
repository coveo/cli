import {test} from '@oclif/test';

jest.mock('inquirer');
import inquirer from 'inquirer';
jest.mock('@coveo/cli-commons/npm/npf');
import npf from '@coveo/cli-commons/npm/npf';
jest.mock('../../lib/utils/misc');
import {getPackageVersion} from '../../lib/utils/misc';
jest.mock('../../lib/utils/process');
import {handleForkedProcess} from '../../lib/utils/process';
jest.mock('../../lib/utils/errorSchemas');
import {isAggregatedErrorLike} from '../../lib/utils/errorSchemas';
import type {ChildProcess} from 'node:child_process';
import {SubprocessError} from '../../lib/errors/subprocessError';

describe('atomic:component', () => {
  const mockedNpf = jest.mocked(npf);
  const mockedInquirer = jest.mocked(inquirer);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedHandleForkedProcess = jest.mocked(handleForkedProcess);
  const mockedIsAggregateErrorLike = jest.mocked(isAggregatedErrorLike);

  beforeEach(() => {
    jest.resetAllMocks();
    mockedGetPackageVersion.mockReturnValue('1.2.3');
    mockedNpf.mockImplementation(() => jest.fn() as unknown as ChildProcess);
  });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=page', 'foo'])
    .it('calls `npm init @coveo/atomic-component` properly', () => {
      expect(mockedNpf).toBeCalledTimes(1);
      expect(mockedNpf.mock.lastCall).toMatchSnapshot();
      expect(mockedHandleForkedProcess).toBeCalledTimes(1);
      expect(mockedHandleForkedProcess).toBeCalledWith(
        mockedNpf.mock.results[0].value
      );
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=result', 'foo'])
    .it('calls `npm init @coveo/atomic-result-component` properly', () => {
      expect(mockedNpf).toBeCalledTimes(1);
      expect(mockedNpf.mock.lastCall).toMatchSnapshot();
      expect(mockedHandleForkedProcess).toBeCalledTimes(1);
      expect(mockedHandleForkedProcess).toBeCalledWith(
        mockedNpf.mock.results[0].value
      );
    });

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'result'});
    })
    .stdout()
    .stderr()
    .command(['atomic:component', 'foo'])
    .it(
      'calls `npm init @coveo/atomic-result-component` when the user select result in the prompt',
      () => {
        expect(mockedNpf).toBeCalledTimes(1);
        expect(mockedNpf.mock.lastCall).toMatchSnapshot();
        expect(mockedHandleForkedProcess).toBeCalledTimes(1);
        expect(mockedHandleForkedProcess).toBeCalledWith(
          mockedNpf.mock.results[0].value
        );
      }
    );

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'page'});
    })
    .stdout()
    .stderr()
    .command(['atomic:component', 'foo'])
    .it(
      'calls `npm init @coveo/atomic-component` when the user select page in the prompt',
      () => {
        expect(mockedNpf).toBeCalledTimes(1);
        expect(mockedNpf.mock.lastCall).toMatchSnapshot();
        expect(mockedHandleForkedProcess).toBeCalledTimes(1);
        expect(mockedHandleForkedProcess).toBeCalledWith(
          mockedNpf.mock.results[0].value
        );
      }
    );

  describe('when `handleForkedProcess` throw an error', () => {
    beforeEach(() => {
      mockedHandleForkedProcess.mockRejectedValueOnce({
        name: 'AggregateError',
        message: 'The quick brown fox jumps over the lazy dog.',
        errors: [
          'Waltz, bad nymph, for quick jigs vex.',
          'Pack my box with five dozen liquor jugs.',
        ],
      });
    });

    describe('when the thrown error is an AggregatedError', () => {
      beforeEach(() => {
        mockedIsAggregateErrorLike.mockReturnValueOnce(true);
      });

      test
        .stdout()
        .stderr()
        .command(['atomic:component', '--type=page', 'foo'])
        .catch((error) => {
          expect(error).toBeInstanceOf(SubprocessError);
          expect(error).toMatchSnapshot();
        })
        .it('calls `npm init @coveo/atomic-component` properly');

      test
        .stdout()
        .stderr()
        .command(['atomic:component', '--type=result', 'foo'])
        .catch((error) => {
          expect(error).toBeInstanceOf(SubprocessError);
          expect(error).toMatchSnapshot();
        })
        .it('calls `npm init @coveo/atomic-result-component` properly');
    });

    describe('when the thrown error is not an AggregatedError', () => {
      beforeEach(() => {
        mockedIsAggregateErrorLike.mockReturnValueOnce(false);
      });

      test
        .stdout()
        .stderr()
        .command(['atomic:component', '--type=page', 'foo'])
        .catch((error) => {
          expect(error).not.toBeInstanceOf(SubprocessError);
          expect(error).toMatchSnapshot();
        })
        .it('calls `npm init @coveo/atomic-component` properly');

      test
        .stdout()
        .stderr()
        .command(['atomic:component', '--type=result', 'foo'])
        .catch((error) => {
          expect(error).not.toBeInstanceOf(SubprocessError);
          expect(error).toMatchSnapshot();
        })
        .it('calls `npm init @coveo/atomic-result-component` properly');
    });
  });
});
