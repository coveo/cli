export function without<T>(array: T[], values: T[]): T[] {
  return array.filter((field) => !values.includes(field));
}

export function isSubset<T>(subset: T[], superset: T[]): boolean {
  if (new Set(subset).size > new Set(superset).size) {
    return false;
  }
  return subset.every((element) => superset.includes(element));
}
