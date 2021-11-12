import {CLIBaseError} from './CLIBaseError';

export interface APIErrorResponse {
  message: string;
  errorCode: string;
  requestID: string;
}

export class APIError extends CLIBaseError {
  public constructor(error: APIErrorResponse) {
    super(error.message);
    this.name = `APIError - ${error.errorCode}`;
  }
}
