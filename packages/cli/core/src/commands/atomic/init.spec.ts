import {test} from '@oclif/test';

jest.mock('inquirer');
import inquirer from 'inquirer';
jest.mock('@coveo/cli-commons/config/config');
import {Config} from '@coveo/cli-commons/config/config';
jest.mock('../../lib/atomic/createAtomicProject');
import {
  createAtomicApp,
  createAtomicLib,
} from '../../lib/atomic/createAtomicProject';

describe('atomic:init', () => {
  const mockedCreateAtomicApp = jest.mocked(createAtomicApp);
  const mockedCreateAtomicLib = jest.mocked(createAtomicLib);
  const mockedInquirer = jest.mocked(inquirer);
  const mockedConfig = jest.mocked(Config);
  const mockedConfigGet = jest.fn();

  const doMockConfig = () => {
    mockedConfigGet.mockReturnValue({
      region: 'us',
      organization: 'default-org',
      environment: 'prod',
    });

    mockedConfig.mockImplementation(
      () =>
        ({
          get: mockedConfigGet,
        } as unknown as Config)
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    doMockConfig();
  });

  test
    .stdout()
    .stderr()
    .command(['atomic:init', '--type=lib', 'foo'])
    .it('calls `createAtomicLib` properly', () => {
      expect(mockedCreateAtomicLib).toBeCalledTimes(1);
      expect(mockedCreateAtomicLib.mock.lastCall).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:init', '--type=library', 'foo'])
    .it('calls `createAtomicLib` properly', () => {
      expect(mockedCreateAtomicLib).toBeCalledTimes(1);
      expect(mockedCreateAtomicLib.mock.lastCall).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:init', '--type=app', 'foo'])
    .it('calls `createAtomicApp` properly', () => {
      expect(mockedCreateAtomicApp).toBeCalledTimes(1);
      expect(mockedCreateAtomicApp.mock.lastCall).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:init', '--type=application', 'foo'])
    .it('calls `createAtomicApp` properly', () => {
      expect(mockedCreateAtomicApp).toBeCalledTimes(1);
      expect(mockedCreateAtomicApp.mock.lastCall).toMatchSnapshot();
    });

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'application'});
    })
    .stdout()
    .stderr()
    .command(['atomic:init', 'foo'])
    .it(
      'calls `createAtomicApp` when the user select application in the prompt',
      () => {
        expect(mockedCreateAtomicApp).toBeCalledTimes(1);
        expect(mockedCreateAtomicApp.mock.lastCall).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'library'});
    })
    .stdout()
    .stderr()
    .command(['atomic:init', 'foo'])
    .it(
      'calls `createAtomicLib` when the user select library in the prompt',
      () => {
        expect(mockedCreateAtomicLib).toBeCalledTimes(1);
        expect(mockedCreateAtomicLib.mock.lastCall).toMatchSnapshot();
      }
    );
});
