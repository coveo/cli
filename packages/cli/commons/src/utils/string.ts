export type Plurable = [singular: string, plural: string];
export function pluralizeIfNeeded(
  plurable: Plurable,
  unprintedMessages: number
) {
  return plurable[unprintedMessages > 1 ? 1 : 0];
}

export function camelToSnakeCase(str: string) {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_+/, '');
}
