const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

export function getPackageManager(noCmd = false) {
  return noCmd
    ? DEFAULT_PACKAGE_MANAGER
    : appendCmdIfWindows(DEFAULT_PACKAGE_MANAGER);
}
