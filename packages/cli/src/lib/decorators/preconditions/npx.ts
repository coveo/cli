import {getBinInstalledPrecondition} from './binPreconditionsFactory';

export const IsNpxInstalled = getBinInstalledPrecondition('npx', {
  howToInstallBinText: 'Newer version Node.js comes bundled with npx.',
});
