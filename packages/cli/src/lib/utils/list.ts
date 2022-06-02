export function without<T>(array: T[], values: T[]): T[] {
  return array.filter((field) => !values.includes(field));
}

export function containsDuplicates<T>(values: T[]): boolean {
  const set = new Set(values);
  return set.size === values.length;
}
