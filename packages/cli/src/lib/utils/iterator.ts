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

export const consumeGenerator = async (
  generator: () => Generator<Promise<void>, void, unknown>,
  maxConcurrent: number
) => {
  const doWork = async (
    generator: Generator<Promise<void>, void, unknown>
  ): Promise<void> => {
    const next = generator.next();
    if (next.done) {
      return;
    }
    await next.value;
    return doWork(generator);
  };
  const workers = new Array(maxConcurrent).fill(generator()).map(doWork);

  return Promise.all(workers);
};
