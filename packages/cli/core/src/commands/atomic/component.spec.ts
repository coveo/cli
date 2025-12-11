import {test} from '@oclif/test';

jest.mock('inquirer');
import inquirer from 'inquirer';
// Mock the compiled JavaScript module that oclif/test will load
jest.mock('../../../lib/lib/utils/process');
import {spawnProcess} from '../../../lib/lib/utils/process';

describe('atomic:component', () => {
  const mockedInquirer = jest.mocked(inquirer);
  const mockedSpawnProcess = jest.mocked(spawnProcess);

  beforeEach(() => {
    jest.resetAllMocks();
    mockedSpawnProcess.mockResolvedValue(0);
  });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=page', 'test-component'])
    .it('calls `npx @coveo/create-atomic-component` properly', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess).toHaveBeenCalledWith(
        expect.stringMatching(/npx/),
        ['@coveo/create-atomic-component@latest', 'test-component']
      );
    });

  test
    .stdout()
    .stderr()
    .command(['atomic:component', '--type=result', 'test-component'])
    .it('calls `npx @coveo/create-atomic-result-component` properly', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess).toHaveBeenCalledWith(
        expect.stringMatching(/npx/),
        ['@coveo/create-atomic-result-component@latest', 'test-component']
      );
    });

  test
    .stdout()
    .stderr()
    .command([
      'atomic:component',
      '--type=page',
      '--version=1.2.3',
      'test-component',
    ])
    .it('uses the specified version', () => {
      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess).toHaveBeenCalledWith(
        expect.stringMatching(/npx/),
        ['@coveo/create-atomic-component@1.2.3', 'test-component']
      );
    });

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'result'});
    })
    .stdout()
    .stderr()
    .command(['atomic:component', 'test-component'])
    .it(
      'calls `npx @coveo/create-atomic-result-component` when the user select result in the prompt',
      () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess).toHaveBeenCalledWith(
          expect.stringMatching(/npx/),
          ['@coveo/create-atomic-result-component@latest', 'test-component']
        );
      }
    );

  test
    .do(() => {
      mockedInquirer.prompt.mockResolvedValue({type: 'page'});
    })
    .stdout()
    .stderr()
    .command(['atomic:component', 'test-component'])
    .it(
      'calls `npx @coveo/create-atomic-component` when the user select page in the prompt',
      () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess).toHaveBeenCalledWith(
          expect.stringMatching(/npx/),
          ['@coveo/create-atomic-component@latest', 'test-component']
        );
      }
    );

  describe('security: command injection prevention', () => {
    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component;whoami'])
      .catch(/Invalid component name/)
      .it('should reject component names with semicolons');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component&whoami'])
      .catch(/Invalid component name/)
      .it('should reject component names with ampersands');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component|whoami'])
      .catch(/Invalid component name/)
      .it('should reject component names with pipes');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component`whoami`'])
      .catch(/Invalid component name/)
      .it('should reject component names with backticks');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component$(whoami)'])
      .catch(/Invalid component name/)
      .it('should reject component names with command substitution');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component/path'])
      .catch(/Invalid component name/)
      .it('should reject component names with slashes');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'test-component..'])
      .catch(/Invalid component name/)
      .it('should reject component names with dots');

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'valid-component-name'])
      .it('should accept valid component names with hyphens', () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'my-component'])
      .it('should accept valid component names with multiple words', () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
      });

    test
      .stdout()
      .stderr()
      .command(['atomic:component', '--type=page', 'component-v2'])
      .it('should accept valid component names with numbers', () => {
        expect(mockedSpawnProcess).toBeCalledTimes(1);
      });
  });
});
