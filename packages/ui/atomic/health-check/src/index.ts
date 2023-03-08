#!/usr/bin/env node

import {
  ensureInternalScope,
  ensureNaming,
  ensureReadme,
  ensureRequiredProperties,
} from './assertions';
import {prettifyJsonValidationError} from './error';
import {Inspector} from './inspector';

try {
  new Inspector()
    .check(ensureNaming, 'Ensure naming standard')
    .check(ensureReadme, 'Ensure Readme file')
    .check(ensureRequiredProperties, 'Required properties in package.json')
    .check(ensureInternalScope, 'Valid scope')
    .report();
} catch (error) {
  console.error('something went wrong... use --skip to skip....');
  //   console.log(getPrettyJsonValidationErrors(error as any)); // TODO: should be in the Checker
  //   TODO: stop execution
}
