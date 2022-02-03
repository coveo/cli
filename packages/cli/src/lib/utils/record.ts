type Recordable<T> = {
  [P in keyof T]: T[P];
};

export const recordable = <T>(obj: T[]): Recordable<T>[] => obj;
