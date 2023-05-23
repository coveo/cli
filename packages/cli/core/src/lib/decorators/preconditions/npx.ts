import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsNpxInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`npx`,
  {
    prettyName: 'npx',
    howToInstallBinText: 'Newer version Node.js comes bundled with npx.',
  }
);
