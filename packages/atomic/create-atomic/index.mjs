#!/usr/bin/env node
import path from 'node:path';
import minimist from 'minimist';
import {Plop, run} from 'plop';

const args = process.argv.slice(2);
const argv = minimist(args);

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(path.join(__dirname, 'lib/plopfile.js'));
console.log('=-=-=-=-=-=-=- ENV DUMP -=-=-=-=-=-=-=');
console.log(JSON.stringify(process.env));
console.log('=-=-=-=-=-=-=- DUMP END -=-=-=-=-=-=-=');
Plop.prepare(
  {
    cwd: argv.cwd,
    configPath: path.join(__dirname, 'lib/plopfile.js'),
    preload: argv.preload || [],
    completion: argv.completion,
  },
  (env) =>
    Plop.execute(env, (env) => {
      const options = {
        ...env,
        dest: process.cwd(),
      };
      return run(options, undefined, true);
    })
);
