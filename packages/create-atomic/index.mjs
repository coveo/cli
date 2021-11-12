#!/usr/bin/env node
import {fileURLToPath} from 'url';
import {join, dirname} from 'path';
import {Plop, run} from 'plop';
import minimist from 'minimist';

const args = process.argv.slice(2);
const argv = minimist(args);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Plop.launch(
  {
    cwd: argv.cwd,
    configPath: join(__dirname, 'plopfile.ts'),
    require: argv.require,
    completion: argv.completion,
  },
  (env) => run(env, undefined, true)
);
