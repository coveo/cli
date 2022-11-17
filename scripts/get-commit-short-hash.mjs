import {exportVariable, setFailed} from '@actions/core';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {binariesMatcher} from './oclifArtifactMatchers.mjs';

// Should be executed at the root of the CLI workspace.
const pathToArtifacts = join('dist', process.platform);
const artifacts = readdirSync(pathToArtifacts, {withFileTypes: true});
const someExe = artifacts.find(
  (candidate) => candidate.isFile() && candidate.name.endsWith('.exe')
);

if (!binariesMatcher.exec(someExe.name)?.groups?.commitSHA) {
  setFailed('Binary does not match');
}
exportVariable(
  'commitSHA1',
  binariesMatcher.exec(someExe.name).groups.commitSHA
);
