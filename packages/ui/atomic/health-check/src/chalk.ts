const createStyle =
  (open: string, close: string) =>
  (text: string): string =>
    `${open}${text}${close}`;

const chalk = {
  bold: createStyle('\u001b[1m', '\u001b[22m'),
  green: createStyle('\u001b[32m', '\u001b[39m'),
  red: createStyle('\u001b[31m', '\u001b[39m'),
};

export default chalk;
