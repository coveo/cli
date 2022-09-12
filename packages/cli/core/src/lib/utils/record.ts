export function recordable<T, K extends keyof T>(obj: T[]): Pick<T, K>[] {
  return obj.map((o) =>
    Object.entries(o).reduce(
      (o, key) => ({...o, [key[0]]: key[1]}),
      {} as Pick<T, K>
    )
  );
}
