type AnsiStyle = {
  open: string;
  close: string;
};

const formatText = (styles: AnsiStyle[], messages: unknown[]) => {
  const text = messages.map(String).join(' ');
  const open = styles.map((style) => style.open).join('');
  const close = styles
    .slice()
    .reverse()
    .map((style) => style.close)
    .join('');

  return `${open}${text}${close}`;
};

const normalizeHexColor = (color: string) => {
  const hex = color.replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return hex
      .split('')
      .map((digit) => `${digit}${digit}`)
      .join('');
  }

  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : null;
};

const createRgbStyle = (
  color: string,
  background = false
): AnsiStyle | null => {
  const hex = normalizeHexColor(color);
  if (!hex) {
    return null;
  }

  const [red, green, blue] = [0, 2, 4].map((index) =>
    Number.parseInt(hex.slice(index, index + 2), 16)
  );
  const prefix = background ? '48' : '38';
  const close = background ? '\u001b[49m' : '\u001b[39m';

  return {
    open: `\u001b[${prefix};2;${red};${green};${blue}m`,
    close,
  };
};

const namedStyles = {
  blueBright: {open: '\u001b[94m', close: '\u001b[39m'},
  bold: {open: '\u001b[1m', close: '\u001b[22m'},
  cyan: {open: '\u001b[36m', close: '\u001b[39m'},
  dim: {open: '\u001b[2m', close: '\u001b[22m'},
  gray: {open: '\u001b[90m', close: '\u001b[39m'},
  green: {open: '\u001b[32m', close: '\u001b[39m'},
  inverse: {open: '\u001b[7m', close: '\u001b[27m'},
  italic: {open: '\u001b[3m', close: '\u001b[23m'},
  magenta: {open: '\u001b[35m', close: '\u001b[39m'},
  red: {open: '\u001b[31m', close: '\u001b[39m'},
  yellow: {open: '\u001b[33m', close: '\u001b[39m'},
} as const;

type NamedStyle = keyof typeof namedStyles;

export type ChalkFunction = ((...messages: unknown[]) => string) & {
  blueBright: ChalkFunction;
  bold: ChalkFunction;
  cyan: ChalkFunction;
  dim: ChalkFunction;
  gray: ChalkFunction;
  green: ChalkFunction;
  inverse: ChalkFunction;
  italic: ChalkFunction;
  magenta: ChalkFunction;
  red: ChalkFunction;
  yellow: ChalkFunction;
  hex: (color: string) => ChalkFunction;
  bgHex: (color: string) => ChalkFunction;
};

export type Chalk = ChalkFunction;

const createChalk = (styles: AnsiStyle[] = []): ChalkFunction => {
  const chalker = ((...messages: unknown[]) =>
    formatText(styles, messages)) as ChalkFunction;
  const withStyle = (style: AnsiStyle | null) =>
    createChalk(style ? [...styles, style] : styles);
  const withNamedStyle = (style: NamedStyle) => () =>
    withStyle(namedStyles[style]);

  for (const style of Object.keys(namedStyles) as NamedStyle[]) {
    Object.defineProperty(chalker, style, {
      configurable: true,
      enumerable: true,
      get: withNamedStyle(style),
    });
  }
  chalker.hex = (color: string) => withStyle(createRgbStyle(color));
  chalker.bgHex = (color: string) => withStyle(createRgbStyle(color, true));

  return chalker;
};

const chalk = createChalk();

export default chalk;

export const blueBright = chalk.blueBright;
export const bold = chalk.bold;
export const cyan = chalk.cyan;
export const dim = chalk.dim;
export const gray = chalk.gray;
export const green = chalk.green;
export const inverse = chalk.inverse;
export const italic = chalk.italic;
export const magenta = chalk.magenta;
export const red = chalk.red;
export const yellow = chalk.yellow;
