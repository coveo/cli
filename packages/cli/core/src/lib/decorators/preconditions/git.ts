import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsGitInstalled = getBinInstalledPrecondition('git', {
  prettyName: 'Git',
  installLink: 'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git',
});
