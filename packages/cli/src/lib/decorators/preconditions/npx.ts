import Command from '@oclif/command';
import dedent = require('dedent');
import {spawnProcessOutput} from '../../utils/process';

import {isMissingExecutable, warnHowToInstallNode} from './node';

export function IsNpxInstalled() {
  return async function (target: Command) {
    const output = await spawnProcessOutput('npx', ['--version']);

    if (isMissingExecutable(output)) {
      target.warn(dedent`
        ${target.id} requires npx to run.
        Newer version Node.js comes bundled with npx.
      `);
      warnHowToInstallNode(target);
      return false;
    }

    if (output.stderr) {
      target.warn(dedent`
        ${target.id} requires a valid npx installation to run.
        An unknown error happened while checking for npx with npx --version.
        ${output.stderr}
      `);
      warnHowToInstallNode(target);
      return false;
    }

    return true;
  };
}
