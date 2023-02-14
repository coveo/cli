#!/usr/bin/env node
import {dirname, resolve} from 'node:path';
import {
  cpSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from 'node:fs';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);
const main = () => {
  const cwdFiles = readdirSync(cwd(), {withFileTypes: true});
  if (cwdFiles.length > 0) {
    if (cwdFiles.some((dirent) => dirent.name === 'package.json')) {
      return;
    } else {
      throw new Error(
        'Current working directory is not empty nor it is a npm project (no package.json found). Please try again in an empty directory.'
      );
    }
  }

  cpSync(templateDirPath, cwd(), {
    recursive: true,
  });

  const transformers = [
    // https://github.com/npm/cli/issues/5756
    {srcPath: '.npmignore', destPath: '.gitignore'},
  ];

  // TODO: Refactor the transformers processing in an utils package
  for (const transformer of transformers) {
    if (!transformer.srcPath) {
      continue;
    }
    if (!transformer.destPath) {
      unlinkSync(transformer.srcPath);
      continue;
    }

    renameSync(transformer.srcPath, transformer.destPath);
    if (transformer.transform) {
      writeFileSync(
        transformer.destPath,
        transformer.transform(readFileSync(transformer.destPath, 'utf8'))
      );
    }
  }
};

main();
