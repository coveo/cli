export const appendCmdIfWindows = (cmd: TemplateStringsArray) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;
