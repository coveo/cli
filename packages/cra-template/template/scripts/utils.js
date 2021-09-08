const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

function getPackageManager() {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env['npm_config_user_agent'].match(firstUserAgent) ??
    DEFAULT_PACKAGE_MANAGER;
  return appendCmdIfWindows(packageManager);
}

module.exports = {getPackageManager};
