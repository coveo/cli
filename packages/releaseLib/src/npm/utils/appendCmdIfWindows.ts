export const appendCmdIfWindows = (cmd: any) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;
