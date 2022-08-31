import chalk from 'chalk';

export const ReportViewerStyles = {
  green: (txt: string) => chalk.green(txt),
  yellow: (txt: string) => chalk.yellow(txt),
  red: (txt: string) => chalk.red(txt),
  gray: (txt: string) => chalk.gray(txt),
  header: (txt: string) => chalk.bold.hex('#1CEBCF')(txt),
  error: (txt: string) => chalk.bgHex('#F64D64').hex('#272C3A')(txt),
};
