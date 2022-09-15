export function without<T>(array: T[], values: T[]): T[] {
  return array.filter((field) => !values.includes(field));
}

export function isSubset<T>(subset: T[], superset: T[]): boolean {
  return without(subset, superset).length === 0;
}
