import {appendCmdIfWindows} from '../../utils/os.js';
import {getBinInstalledPrecondition} from './binPreconditionsFactory.js';

export const IsNpxInstalled = getBinInstalledPrecondition(
  appendCmdIfWindows`npx`,
  {
    prettyName: 'npx',
    howToInstallBinText: 'Newer version Node.js comes bundled with npx.',
  }
);
