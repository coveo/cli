import {CLIBaseError} from './CLIBaseError';

export interface APIErrorResponse {
  message: string;
  errorCode: string;
  requestID: string;
}

export const APIErrorSchema = {
  type: 'object',
  message: {type: 'string'},
  errorCode: {type: 'string'},
  requestID: {type: 'string'},
  required: ['message', 'errorCode', 'requestID'],
};

export class APIError extends CLIBaseError {
  public constructor(error: APIErrorResponse) {
    super(error.message);
    this.name = `APIError - ${error.errorCode}`;
  }
}
