#!/usr/bin/env node
import {dirname, resolve} from 'node:path';
import {cpSync} from 'node:fs';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);
cpSync(templateDirPath, cwd(), {recursive: true});
