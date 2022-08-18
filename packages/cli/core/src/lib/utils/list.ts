export function without<T>(array: T[], values: T[]): T[] {
  return array.filter((field) => !values.includes(field));
}
