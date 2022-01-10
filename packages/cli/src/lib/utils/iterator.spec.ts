import {inspect} from 'util';
import {consumeGenerator, consumeIterator} from './iterator';
import {nextTick} from 'process';

class Deferred {
  public promise: Promise<void>;
  private _resolve!: Function;
  public constructor() {
    this.promise = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  public async resolve() {
    this._resolve();
    return this.promise;
  }
}
describe('generator', () => {
  const maxConcurrent = 2;
  const buildPromise = (id: number) => () =>
    new Promise<number>((resolve) => {
      nextTick(() => resolve(id));
    });
  const taskMatrix = [
    [buildPromise(5), buildPromise(6)],
    [buildPromise(1), buildPromise(2), buildPromise(3)],
    [buildPromise(4)],
  ];
  /**
   * The promises should be consumed in this order:
   *  5 6 1 2 3 4
   *
   * And distributed to the workers in this manner:
   *  Worker 1 : 5 1 3
   *  Worker 2 : 6 2 4
   */

  const generator = function* () {
    for (const taskList of taskMatrix) {
      // Flattening first dimension of the task matrix
      for (const task of taskList) {
        // Flattening second dimension of the task matrix
        yield task();
      }
    }
  };

  it('test', async () => {
    const callback = jest.fn();
    await consumeGenerator(generator, maxConcurrent, callback);
    const callSequence: [worker: number, promiseId: number][] = [
      [0, 5],
      [0, 1],
      [0, 3],
      [1, 6],
      [1, 2],
      [1, 4],
    ];
    callSequence.forEach((step) => {
      expect(callback).toHaveBeenCalledWith(step[0], step[1]);
    });
  });
});

describe('iterator', () => {
  const tasks = ['eat', 'drink', 'sleep'] as const;
  const workers: Record<string, Deferred | null> = {};
  const work = (task: string) => {
    const deferred = new Deferred();
    workers[task] = deferred;
    return deferred.promise;
  };
  const expectPending = (task: typeof tasks[number]) => {
    return expect(inspect(workers[task]?.promise)).toMatch(/pending/);
  };
  const expectResolved = (task: typeof tasks[number]) => {
    return expect(inspect(workers[task]?.promise)).not.toMatch(/pending/);
  };

  beforeAll(() => {
    const maxConcurrent = 2;
    tasks.forEach((task) => {
      // Set all tasks to null at first
      workers[task] = null;
    });
    consumeIterator(tasks.values(), work, maxConcurrent);
  });

  describe('when starting to consume tasks', () => {
    it('should work on the first 2 tasks', () => {
      expectPending('eat');
      expectPending('drink');
      expect(workers['sleep']).toBeNull();
    });

    it('should not work on more than 2 tasks', () => {
      expect(workers['sleep']).toBeNull();
    });
  });

  describe('when one of the working tasks is resolved', () => {
    beforeAll(async () => {
      await workers['eat']?.resolve();
    });

    it('should no longer work on the resolved task', () => {
      expectResolved('eat');
    });

    it('should work on a new task', () => {
      expectPending('sleep');
    });
  });

  describe('when all the tasks are resolved', () => {
    beforeAll(async () => {
      await workers['drink']?.resolve();
      await workers['sleep']?.resolve();
    });

    it('should not work on any task', () => {
      expectResolved('eat');
      expectResolved('drink');
      expectResolved('sleep');
    });
  });
});
