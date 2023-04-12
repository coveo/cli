import {renameSync, unlinkSync, writeFileSync, readFileSync} from 'node:fs';

export type Transformer = {
  srcPath: string;
  destPath: string;
  transform?: (text: string) => string;
};

/**
 * Converts a hyphenated string to camelCase. For example, `foo-bar-baz` would be converted to `fooBarBaz`.
 *
 * @param {string} str string to camelize
 */
export const camelize = (str: string) =>
  str
    .replace(/-(.)/g, (_, group) => group.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase());

/**
 * Performs a set of file transformations specified in an array of transformer {@link Transformer}.
 *
 * @param {Transformer[]} transformers an array for {@link Transformer}
 */
export const transform = (transformers: Transformer[]) => {
  for (const {srcPath, destPath, transform} of transformers) {
    if (!srcPath) {
      continue;
    }

    if (!destPath) {
      unlinkSync(srcPath);
      continue;
    }

    renameSync(srcPath, destPath);
    if (transform) {
      writeFileSync(destPath, transform(readFileSync(destPath, 'utf8')));
    }
  }
};
