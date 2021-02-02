import {EventEmitter} from 'events';
import {ChildProcess} from 'child_process';
import {spawnProcess} from './process';

jest.mock('child_process', () => ({
  spawn: jest
    .fn()
    .mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      process.nextTick(() => emitter.emit('close', 0));
      return emitter as ChildProcess;
    })
    .mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      process.nextTick(() => emitter.emit('close', 1));
      return emitter as ChildProcess;
    }),
}));

describe('spawnProcess', () => {
  it('should resolves with a success exit code', () => {
    const command = 'some valid command';
    const args = ['-valid', 'option'];

    return expect(spawnProcess(command, args)).resolves.toEqual(0);
  });

  it('should reject', () => {
    const command = 'invalid commande';
    const args = ['-foo', 'bar'];

    return expect(spawnProcess(command, args)).rejects.toEqual(1);
  });
});
