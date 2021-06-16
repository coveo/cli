import {bgHex, green, yellow, red, bold, gray} from 'chalk';

export const ReportViewerStyles = {
  green: (txt: string) => green(txt),
  yellow: (txt: string) => yellow(txt),
  red: (txt: string) => red(txt),
  gray: (txt: string) => gray(txt),
  header: (txt: string) => bold.hex('#1CEBCF')(txt),
  error: (txt: string) => bgHex('#F64D64').hex('#272C3A')(txt),
};
