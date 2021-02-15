import {expect, test} from '@oclif/test';
import {EventEmitter} from 'events';
jest.mock('../../../hooks/analytics/analytics');
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const successExitCode = 0;
    const emitter = new EventEmitter();
    process.nextTick(() => emitter.emit('close', successExitCode)); // To mock a sucess command
    return emitter as child_process.ChildProcess;
  }),
}));
describe('ui:create:vue', () => {
  test
    .command(['ui:create:vue'])
    .catch((ctx) => {
      expect(ctx.message).to.contain('Missing 1 required arg:');
    })
    .it('requires application name argument');

  test
    .command(['ui:create:vue', 'myapp', '--preset', 'invalidPreset'])
    .catch('Unable to load preset')
    .it('requires a valid preset flag');
});
