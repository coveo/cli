import {CoveoPlatformClientError} from '@coveo/platform-client';
import {red} from 'chalk';
import {CLIBaseError} from './cliBaseError';

export class APIError extends CLIBaseError {
  public constructor(error: CoveoPlatformClientError, tagLine?: string) {
    super();
    let messageParts = [''];

    this.name = 'APIError';
    if (tagLine) {
      messageParts.push(tagLine);
    }

    messageParts.push(`Status code: ${error.status}`);
    messageParts.push(`Error code: ${red(error.title)}`);
    messageParts.push(`Message: ${red(error.detail)}`);
    messageParts.push(`Request ID: ${red(error.xRequestId)}`);

    this.message = messageParts.join('\n');
  }
}
