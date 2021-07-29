import {appendCmdIfWindows} from '../../utils/os';
import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsGitInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`git`,
  {
    prettyName: 'git',
    howToInstallBinText:
      'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git',
  }
);
