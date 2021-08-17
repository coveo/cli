import type Command from '@oclif/command';
import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {getPackageVersion} from '../../utils/misc';
import {appendCmdIfWindows} from '../../utils/os';
import {spawnProcess} from '../../utils/process';
import {getBinInstalledPrecondition} from './binPreconditionsFactory';

const angularCliPackage = '@angular/cli';
async function installAngularCli(target: Command): Promise<boolean> {
  const shouldInstall = await cli.confirm(
    dedent`
        You need to have the Angular-CLI installed on your computer before proceeding.
        Do you want to install it now? (y/n)`
  );
  if (!shouldInstall) {
    return false;
  }
  const version = getPackageVersion(angularCliPackage);
  target.log(`Running npm install --global @angular/cli@${version}.`);
  const output = await spawnProcess(appendCmdIfWindows`npm`, [
    'install',
    '-g',
    `@angular/cli@${version}`,
  ]);
  if (output === 0) {
    return true;
  }
  cli.warn(dedent`
    Angular installation failed, ${target.id} cannot proceed.
    Please try to install Angular-CLI first then try again.
    `);
  return false;
}

export const IsNgInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`ng`,
  {
    prettyName: 'Angular-CLI',
    installLink:
      'https://angular.io/guide/setup-local#install-the-angular-cli>',
    installFunction: installAngularCli,
  }
);
