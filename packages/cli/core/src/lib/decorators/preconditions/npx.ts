import {appendCmdIfWindows} from '../../utils/os';
import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsNpxInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`npx`,
  {
    prettyName: 'npx',
    howToInstallBinText: 'Newer version Node.js comes bundled with npx.',
  }
);
