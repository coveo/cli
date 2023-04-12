import {renameSync, unlinkSync, writeFileSync, readFileSync} from 'node:fs';

export type Transformer = {
  srcPath: string;
  destPath: string;
  transform?: (text: string) => string;
};

export const camelize = (str: string) =>
  str
    .replace(/-(.)/g, (_, group) => group.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase());

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
