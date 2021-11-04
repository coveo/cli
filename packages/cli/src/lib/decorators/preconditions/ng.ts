import {appendCmdIfWindows} from '../../utils/os';
import {getBinVersionPrecondition} from './binPreconditionsFactory';

export const IsNgVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`ng`,
  {
    prettyName: 'Angular-CLI',
    howToInstallBinText:
      'You can install the Angular-CLI by running npm i -g @angular/cli',
    installLink: 'https://angular.io/guide/setup-local#install-the-angular-cli',
  }
);
