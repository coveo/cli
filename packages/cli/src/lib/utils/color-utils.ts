import chalk from 'chalk';

export const customColors = {
  header: chalk.bold.hex('#1CEBCF'),

  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  gray: chalk.gray,

  error: chalk.bgHex('#F64D64').hex('#272C3A'),
  cmd: chalk.blueBright.bold,
};

type availableColors = typeof customColors | typeof chalk;
type augmentedChalk = typeof customColors & typeof chalk;

export const color: typeof customColors & typeof chalk = new Proxy(chalk, {
  get: (chalk, name: keyof availableColors) =>
    customColors[name] ? customColors[name] : chalk[name],
}) as augmentedChalk;

export default color;
