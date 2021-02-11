import {test} from '@oclif/test';
import {EventEmitter} from 'events';
import * as child_process from 'child_process';
import cli from '@angular/cli';

jest.mock('@angular/cli', () => ({
  default: jest.fn().mockImplementation(() => {
    const validExitCode = 0;
    return Promise.resolve(validExitCode);
  }),
}));

// TODO: remove spawn mock once @coveo/angular schematic is published to npm
// CDX-71
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const successExitCode = 0;
    const emitter = new EventEmitter();
    process.nextTick(() => emitter.emit('close', successExitCode)); // To mock a sucess command
    return emitter as child_process.ChildProcess;
  }),
}));

describe('ui:create:angular', () => {
  beforeEach(() => {
    process.chdir = () => {};
  });

  test
    .stdout()
    .command(['ui:create:angular'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .stdout()
    .command(['ui:create:angular', 'myapp', '--defaults'])
    .catch((ctx) => {
      expect(cli).toHaveBeenCalledTimes(2);
      expect(cli).nthCalledWith(1, {
        cliArgs: ['new', 'myapp', '--style', 'scss', '--defaults'],
      });
      expect(cli).nthCalledWith(2, {
        // TODO: Connect to the user's org (CDX-73)
        cliArgs: [
          'add',
          '@coveo/angular',
          '--org-id',
          'bar',
          '--api-key',
          'foo',
          '--defaults',
        ],
      });
    })
    .it('should call the angular cli using the --defaults flag');

  test
    .stdout()
    .command(['ui:create:angular', 'myapp'])
    .catch((ctx) => {
      expect(cli).toHaveBeenCalledTimes(2);
      expect(cli).nthCalledWith(1, {
        cliArgs: ['new', 'myapp', '--style', 'scss'],
      });
      expect(cli).nthCalledWith(2, {
        // TODO: Connect to the user's org (CDX-73)
        cliArgs: [
          'add',
          '@coveo/angular',
          '--org-id',
          'bar',
          '--api-key',
          'foo',
        ],
      });
    })
    .it('should call the angular cli with appropriate argument');
});
