import {appendCmdIfWindows} from '../../utils/os.js';
import {getBinVersionPrecondition} from './binPreconditionsFactory.js';

const angularCliVersionMatcher = /^Angular CLI: (?<version>\d+\.\d+\.\d+)$/m;

export const IsNgVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`ng`,
  {
    prettyName: 'Angular-CLI',
    howToInstallBinText:
      'You can install the Angular-CLI by running npm i -g @angular/cli',
    installLink: 'https://angular.io/guide/setup-local#install-the-angular-cli',
    params: ['version'],
  },
  (stdout: string) =>
    stdout.match(angularCliVersionMatcher)?.groups?.['version'] ?? ''
);
