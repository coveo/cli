export function camelToSnakeCase(str: string) {
  str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_+/, '');
}
