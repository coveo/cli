#!/usr/bin/env node
import oclif from '@oclif/core';
import {fork} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
// In dev mode -> use ts-node and dev plugins
if (!process.env.TS_NODE_PROJECT) {
  const fileAbsolutePath = fileURLToPath(import.meta.url);
  process.env.NODE_OPTIONS = '--loader ts-node/esm`';
  process.env.NODE_ENV = 'development';
  process.env.TS_NODE_PROJECT = resolve(
    dirname(fileAbsolutePath),
    '..',
    'tsconfig.dev.json'
  );
  fork(fileAbsolutePath, {
    env: {
      ...process.env,
      NODE_OPTIONS: `--loader ts-node/esm`,
    },
  });
} else {
  // In dev mode, always show stack traces
  oclif.settings.debug = true;

  // Start the CLI
  oclif
    .run(process.argv.slice(2), import.meta.url)
    .then(oclif.flush)
    .catch(oclif.Errors.handle);
}
