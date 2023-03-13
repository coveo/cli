import {ValidationError} from 'jsonschema';
import {prettifyError, prettifyJsonValidationError} from './error';
import {fail, groupEnd, groupStart, log, newLine, success} from './logger';

type Assertion = () => void | never;

export class Inspector {
  private errorCount = 0;

  public check(assertion: Assertion, message: string) {
    try {
      assertion();
      success(message);
    } catch (error) {
      this.errorCount++;
      fail(message);
      this.printError(error);
    } finally {
      newLine();
    }

    return this;
  }

  public report() {
    if (this.errorCount) {
      log(
        'Publish aborted because some conditions have not been met',
        'Make sure to address the above errors before publishing again'
        // TODO: CDX-1356: Add a link to custom component best practices
      );
      this.terminate();
    }
  }

  private printError(error: any) {
    if (Array.isArray(error)) {
      error.forEach((err) => this.printError(err));
    }

    groupStart();
    if (error instanceof ValidationError) {
      prettifyJsonValidationError(error);
    }

    if (error instanceof Error) {
      prettifyError(error);
    }
    groupEnd();
  }

  private terminate() {
    process.exit(1);
  }
}
