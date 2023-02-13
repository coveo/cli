#!/usr/bin/env node
import {dirname, resolve, join} from 'node:path';
import {cpSync, renameSync, constants, existsSync} from 'node:fs';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);
cpSync(templateDirPath, cwd(), {recursive: true});
// https://github.com/npm/cli/issues/5756
const ignorePath = join(cwd(), '.npmignore');
if (existsSync(ignorePath, constants.W_OK)) {
  renameSync(join(cwd(), '.npmignore'), join(cwd(), '.gitignore'));
}
