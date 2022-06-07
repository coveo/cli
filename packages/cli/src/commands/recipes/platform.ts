import {bold} from 'chalk';
import {Command} from '@oclif/core';

export default class PlatformRecipe extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Run a platform recipe`;

  public static flags = {};

  public static args = [];

  public async run() {
    this.warn('Not implemented yet');
  }

  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }
}
