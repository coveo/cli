import dedent from 'ts-dedent';
import type {URL} from 'url';
import {CLIBaseError} from '@coveo/cli-commons/errors/cliBaseError';

export class AuthorizationError extends CLIBaseError {
  public name = 'Authorization Error';
  public constructor(public url: URL) {
    super();

    this.message = [
      url.searchParams.get('error'),
      url.searchParams.get('error_description'),
      url.searchParams.get('error_uri'),
    ]
      .filter((value) => value !== null)
      .join('\n');
  }
}

export class InvalidStateError extends CLIBaseError {
  public name = 'Invalid State Error';
  public constructor(receivedState: string, expectedState: string) {
    super();

    this.message = dedent`Unexpected state in authorization request.
    Expected state: ${expectedState}
    Received state: ${receivedState}`;
  }
}

export class OAuthPortBusy extends CLIBaseError {
  public name = 'OAuth ports busy';
  public constructor() {
    super();

    this.message = dedent`
      TCP port 32111 and 52296 are both busy.
      The CLI needs at least of one of them to complete the login process.
      Free one of them or use \`coveo auth:token\` to authenticate.
    `;
  }
}
