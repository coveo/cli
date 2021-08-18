import {appendCmdIfWindows} from '../../utils/os';
import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsNgInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`ng`,
  {
    prettyName: 'Angular-CLI',
    howToInstallBinText:
      'You can install the Angular-CLI by running npm i -g @angular/cli',
    installLink: 'https://angular.io/guide/setup-local#install-the-angular-cli',
  }
);
