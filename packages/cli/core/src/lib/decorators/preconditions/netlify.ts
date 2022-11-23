import {appendCmdIfWindows} from '../../utils/os';
import {getBinVersionPrecondition} from './binPreconditionsFactory';

const angularCliVersionMatcher = /^netlify-cli\/(?<version>\d+\.\d+\.\d+).*$/m;

export const IsNetlifyCliVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`netlify`,
  {
    prettyName: 'Netlify-CLI',
    howToInstallBinText:
      'You can install the Netlify-CLI by running npm i -g netlify-cli',
    installLink: 'https://docs.netlify.com/cli/get-started/#installation',
    params: ['version'],
  },
  (stdout: string) =>
    stdout.match(angularCliVersionMatcher)?.groups?.['version'] ?? ''
);
