import {test} from '@oclif/test';

jest.mock('inquirer');
import inquirer from 'inquirer';
jest.mock('../../lib/utils/os');
import {appendCmdIfWindows} from '../../lib/utils/os';
jest.mock('../../lib/utils/process');
import {spawnProcess} from '../../lib/utils/process';
jest.mock('../../lib/utils/misc');
import {getPackageVersion} from '../../lib/utils/misc';

describe('atomic:component', () => {
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedInquirer = jest.mocked(inquirer);
  const mockAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);

  beforeEach(() => {
    jest.resetAllMocks();
    mockAppendCmdIfWindows.mockImplementation(
      (input: TemplateStringsArray) => `${input}`
    );
    mockedGetPackageVersion.mockReturnValue('1.2.3');
  });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=page', 'foo'])
    .it('calls `npm init @coveo/atomic-component` properly', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=result', 'foo'])
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
    .command(['atomic:component', 'foo'])
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
    .command(['atomic:component', 'foo'])
    .it(
      'calls `npm init @coveo/atomic-component` when the user select page in the prompt',
      () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      }
    );
});
