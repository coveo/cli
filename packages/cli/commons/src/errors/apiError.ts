import {red} from 'chalk';
import {validate} from 'jsonschema';
import {CLIBaseError} from './cliBaseError';

export interface APIErrorResponse {
  message: string;
  errorCode: string;
  requestID: string;
}

export interface AxiosErrorFromAPI {
  response: {
    status: number;
    data: APIErrorResponse;
  };
}

export const APIErrorSchema = {
  type: 'object',
  required: ['errorCode', 'message'],
  properties: {
    errorCode: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
  },
};

export const AxiosErrorFromAPISchema = {
  type: 'object',
  required: ['response'],
  properties: {
    response: {
      type: 'object',
      required: ['status', 'data'],
      properties: {
        status: {
          type: 'integer',
        },
        data: APIErrorSchema,
      },
    },
  },
};

export class APIError extends CLIBaseError {
  public constructor(
    error: APIErrorResponse | AxiosErrorFromAPI,
    tagLine?: string
  ) {
    super();
    let status: number | undefined;
    let messageParts = [''];
    const {errorCode, message, requestID} = this.isFromAxios(error)
      ? error.response.data
      : error;

    if (this.isFromAxios(error)) {
      status = error.response.status;
    }

    this.name = 'APIError';
    if (tagLine) {
      messageParts.push(tagLine);
    }
    if (status) {
      messageParts.push(`Status code: ${status}`);
    }
    this.message = [
      ...messageParts,
      `Error code: ${red(errorCode)}`,
      `Message: ${red(message)}`,
      `Request ID: ${red(requestID)}`,
    ].join('\n');
  }

  private isFromAxios(
    error: APIErrorResponse | AxiosErrorFromAPI
  ): error is AxiosErrorFromAPI {
    return 'response' in error;
  }
}

export function isErrorFromAPI(arg: unknown): arg is APIErrorResponse {
  try {
    return validate(arg, APIErrorSchema).valid;
  } catch (error) {
    return false;
  }
}

export function isAxiosError(error: unknown): error is AxiosErrorFromAPI {
  return validate(error, AxiosErrorFromAPISchema).valid;
}
