#!/usr/bin/env node

import {
  ensureConsistentTagName,
  ensureReadme,
  ensureRequiredProperties,
} from './assertions.js';
import {Inspector} from './inspector.js';

try {
  new Inspector()
    .check(ensureConsistentTagName, 'Component name')
    .check(ensureReadme, 'Readme file')
    .check(ensureRequiredProperties, 'Required properties in package.json')
    // .check(ensureInternalScope, 'Valid scope') //TODO: CDX-1266
    .report();
} catch (error) {
  console.error('Something went wrong during health check:', error);
  process.exit(1);
}
