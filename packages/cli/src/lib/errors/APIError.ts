import {red} from 'chalk';
import dedent from 'ts-dedent';
import {PrintableError, SeverityLevel} from './printableError';

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

export class APIError extends PrintableError {
  public constructor(
    error: APIErrorResponse | AxiosErrorFromAPI,
    tagLine?: string
  ) {
    super(SeverityLevel.Error);
    let errorCode: string;
    let message: string;
    let status: number | undefined;
    if (this.isFromAxios(error)) {
      errorCode = error.response.data.errorCode;
      message = error.response.data.message;
      status = error.response.status;
    } else {
      errorCode = error.errorCode;
      message = error.message;
    }

    this.name = `APIError - ${errorCode}`;
    this.message = dedent`
    ${tagLine}
    ${status ? `Status code: ${status}\n` : ""}
    Error code: ${red(errorCode)}
    Message: ${red(message)}
    `;
  }

  private isFromAxios(
    error: APIErrorResponse | AxiosErrorFromAPI
  ): error is AxiosErrorFromAPI {
    return 'response' in error;
  }
}
