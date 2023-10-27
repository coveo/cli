#!/usr/bin/env node

import {readFileSync} from 'node:fs';
import {setOutput} from '@actions/core';

const CLI_PKG_MATCHER = /^@coveo\/cli@(?<version>\d+\.\d+\.\d+)$/gm;
const packagesReleased = readFileSync('.git-message', {
  encoding: 'utf-8',
}).trim();

// If `@coveo/cli` has not been released we should not build it etc.
const shouldReleaseCli = CLI_PKG_MATCHER.test(packagesReleased);
setOutput('shouldReleaseCli', shouldReleaseCli);
