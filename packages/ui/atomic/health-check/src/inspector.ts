import {ZodError} from 'zod';
import {prettifyError, prettifyZodError} from './error.js';
import chalk from 'chalk';
import {
  failure,
  groupEnd,
  groupStart,
  log,
  newLine,
  success,
} from './logger.js';

export type Assertion = () => void | never;

export class Inspector {
  private hasErrors = false;

  public check(assertion: Assertion, message: string) {
    try {
      assertion();
      success(chalk.bold(message));
    } catch (error) {
      failure(chalk.bold(message));
      this.printError(error);
      this.hasErrors = true;
    } finally {
      newLine();
    }

    return this;
  }

  public report() {
    if (this.hasErrors) {
      log(
        'Publish aborted because some conditions have not been met',
        'Make sure to address the above errors before publishing again',
        'Please visit https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/#publish-your-custom-component for publish instructions.'
      );
      this.terminate();
    }
  }

  private printError(error: any) {
    groupStart();
    if (error instanceof ZodError) {
      prettifyZodError(error);
    } else if (error instanceof Error) {
      prettifyError(error);
    }
    groupEnd();
  }

  private terminate() {
    process.exit(1);
  }
}
