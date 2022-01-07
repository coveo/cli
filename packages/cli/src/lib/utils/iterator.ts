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
