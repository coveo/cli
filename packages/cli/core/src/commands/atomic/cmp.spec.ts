import {test} from '@oclif/test';

jest.mock('inquirer');
import inquirer from 'inquirer';
jest.mock('../../lib/utils/process');
import {spawnProcess} from '../../lib/utils/process';
jest.mock('../../lib/utils/os');

describe('atomic:cmp', () => {
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedInquirer = jest.mocked(inquirer);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test
    .stdout()
    .stderr()
    .command(['atomic:cmp', '--type=page', 'foo'])
    .it('calls `npm init @coveo/atomic-component` properly', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:cmp', '--type=result', 'foo'])
    .it('calls `npm init @coveo/atomic-result-component` properly', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
    });

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'result'});
    })
    .stdout()
    .stderr()
    .command(['atomic:cmp', 'foo'])
    .it(
      'calls `npm init @coveo/atomic-result-component` when the user select result in the prompt',
      () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'page'});
    })
    .stdout()
    .stderr()
    .command(['atomic:cmp', 'foo'])
    .it(
      'calls `npm init @coveo/atomic-component` when the user select page in the prompt',
      () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      }
    );
});
