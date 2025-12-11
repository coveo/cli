import {EventEmitter} from 'events';
import type {ChildProcess} from 'child_process';
import {handleForkedProcess, spawnProcess} from './process';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
jest.mock('cross-spawn');
import crossSpawn from 'cross-spawn';

describe('spawnProcess', () => {
  const mockedCrossSpawn = jest.mocked(crossSpawn);
  fancyIt()('should resolve with a success exit code', () => {
    mockedCrossSpawn.mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      process.nextTick(() => emitter.emit('close', 0));
      return emitter as ChildProcess;
    });

    const command = 'some valid command';
    const args = ['-valid', 'option'];

    return expect(spawnProcess(command, args)).resolves.toEqual(0);
  });

  fancyIt()('should reject', () => {
    mockedCrossSpawn.mockImplementationOnce(() => {
      const emitter = new EventEmitter();
      process.nextTick(() => emitter.emit('close', 1));
      return emitter as ChildProcess;
    });

    const command = 'invalid commande';
    const args = ['-foo', 'bar'];

    return expect(spawnProcess(command, args)).rejects.toEqual(1);
  });

  describe('handleForkedProcess', () => {
    it('should resolve the returned promise when the subprocess exits', async () => {
      const fakeSubProcess = (() => {
        const emitter = new EventEmitter();
        process.nextTick(() => emitter.emit('exit', 0));
        return emitter as ChildProcess;
      })();

      await expect(handleForkedProcess(fakeSubProcess)).resolves.not.toThrow();
    });

    it('should reject the returned promise when the subprocess sends a message', async () => {
      const fakeSubProcess = (() => {
        const emitter = new EventEmitter();
        process.nextTick(() => emitter.emit('message', 'potato'));
        return emitter as ChildProcess;
      })();

      await expect(handleForkedProcess(fakeSubProcess)).rejects.toBe('potato');
    });
  });
});
