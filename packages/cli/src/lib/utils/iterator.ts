type PromiseGenerator<T> = Generator<Promise<T>, void, unknown>;

export const consumeIterator = async <T>(
  iterator: IterableIterator<T>,
  work: (item: T) => Promise<void>,
  maxConcurrent: number
) => {
  const doWork = async (iterator: IterableIterator<T>) => {
    for (const value of iterator) {
      await work(value);
    }
  };

  const workers = new Array(maxConcurrent).fill(iterator).map(doWork);

  return Promise.allSettled(workers);
};

export const createWorkers = <T>(
  generator: () => PromiseGenerator<T>,
  maxConcurrent: number,
  doWork: (
    generator: PromiseGenerator<T>,
    workerIndex: number
  ) => Promise<T | void>
) => {
  return new Array(maxConcurrent)
    .fill(generator())
    .map((gen: PromiseGenerator<T>, workerIndex: number) =>
      doWork(gen, workerIndex)
    );
};

/**
 * Consumes a generator function concurrently
 *
 * @template T
 * @param {() => PromiseGenerator<T>} generator The generator function to consume.
 * @param {number} maxConcurrent The number of maximum concurrent workers.
 * @param {(worker: number, promiseValue: Awaited<T>) => void} [callback] A callback function that runs after each iteration of the iterator. It takes in argument the promise resolved value as well as the worker (ID) assigned to fulfill that promise.
 */
export const consumeGenerator = async <T>(
  generator: () => PromiseGenerator<T>,
  maxConcurrent: number,
  callback?: (worker: number, promiseValue: Awaited<T>) => void
) => {
  const doWork = async (
    generator: PromiseGenerator<T>,
    workerIndex: number
  ): Promise<T | void> => {
    const next = generator.next();
    if (next.done) {
      return;
    }
    const value = await next.value;
    if (callback) {
      callback(workerIndex, value);
    }
    return doWork(generator, workerIndex);
  };

  const workers = createWorkers(generator, maxConcurrent, doWork);
  return Promise.all(workers);
};
