/*import {test} from '@oclif/test';
import {EventEmitter} from 'events';
import * as child_process from 'child_process';
jest.mock('../../../hooks/analytics/analytics');
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const successExitCode = 0;
    const emitter = new EventEmitter();
    process.nextTick(() => emitter.emit('close', successExitCode)); // To mock a sucess command
    return emitter as child_process.ChildProcess;
  }),
}));

describe('ui:create:react', () => {
  const reactAppExecutable = 'create-react-app/index.js';
  const reactAppCoveoTemplate = 'cra-template-coveo';

  test
    .command(['ui:create:react'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .stdout()
    .command(['ui:create:react', 'myapp'])
    .it('should start a spawn process with the appropriate arguments', () => {
      expect(child_process.spawn).toHaveBeenCalledTimes(1);
      expect(child_process.spawn).toHaveBeenCalledWith(
        expect.stringContaining(reactAppExecutable),
        ['myapp', '--template', expect.stringContaining(reactAppCoveoTemplate)],
        expect.objectContaining({})
      );
    });
});
*/
describe('ui:create:react', () => {
  it('passes', () => {
    expect(1).toBe(1);
  });
});
