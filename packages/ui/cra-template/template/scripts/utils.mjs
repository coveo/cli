const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

export function getPackageManager(noCmd = false) {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env['npm_config_user_agent'].match(firstUserAgent) ??
    DEFAULT_PACKAGE_MANAGER;
  return noCmd ? packageManager : appendCmdIfWindows(packageManager);
}
