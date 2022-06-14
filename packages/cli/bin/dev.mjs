#!/usr/bin/env node

import {run, flush, Errors, settings} from '@oclif/core';
import {fork} from 'child_process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development';

// In dev mode, always show stack traces
settings.debug = true;

if (process.env.TS_NODED) {
  // Start the CLI
  console.log('HELLO');
  const args =JSON.parse(process.env.CLI_OG_ARGV);
  console.log(args);
  run(args.slice(2), import.meta.url)
    .then(flush)
    .catch(Errors.handle);
} else {
  (async () => {
    await new Promise((resolve) => {
      fork(fileURLToPath(import.meta.url), {
        cwd: join(__dirname, '..', '..', '..'),
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: (process.env.NODE_OPTIONS = '--loader ts-node/esm --experimental-json-modules'),
          TS_NODED: 'true',
          TS_NODE_PROJECT: join(__dirname, '..', 'tsconfig.json'),
          CLI_OG_ARGV: JSON.stringify(process.argv),
        },
      }).on('exit', resolve);
    });
  })();
}
