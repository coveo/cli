import {ValidationError} from 'jsonschema';
import chalk from 'chalk';
import {prettifyError, prettifyJsonValidationError} from './error';

type Assertion = () => void | never;

export class Inspector {
  private errorCount = 0;

  public check(assertion: Assertion, message: string) {
    try {
      assertion();
      this.success(message);
    } catch (error) {
      this.errorCount++;
      this.fail(message);
      this.printError(error); // TODO: not sure if should save logs in mem and print them at the end
    }

    return this;
  }

  public report() {
    if (this.errorCount) {
      ('cannot publish until all the above condition are met');
      ('For more information visit http://best-practices'); // TODO: CDX-1356
    }
    // this.formatError(this.error)
  }

  private printError(error: any) {
    if (Array.isArray(error)) {
      error.forEach((err) => this.printError(err));
    }

    if (error instanceof ValidationError) {
      prettifyJsonValidationError(error);
    }

    if (error instanceof Error) {
      prettifyError(error);
    }
  }

  private success(message: string) {
    console.log([chalk.green('✔'), message].join(' '));
  }

  private fail(message: string) {
    console.log([chalk.red('!'), message].join(' '));
  }
}
