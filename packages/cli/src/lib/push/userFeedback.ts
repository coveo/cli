import {Command} from '@oclif/core';
import {green} from 'chalk';
import {validate} from 'jsonschema';
import dedent from 'ts-dedent';
import {
  APIError,
  AxiosErrorFromAPI,
  AxiosErrorFromAPISchema,
  isAxiosError,
} from '../errors/APIError';
import {UnknownError} from '../errors/unknownError';

export interface AxiosResponse {
  status: number;
  statusText: string;
}

export const successMessage = (
  cmd: Command,
  tagLine: string,
  res?: AxiosResponse
) => {
  let message = dedent(`
      ${tagLine}
      `);
  if (res) {
    message += `Status code: ${green(res.status, res.statusText)}
    `;
  }
  cmd.log(message);
};

// TODO: not sure how to handle that. This is code duplication. Error should be handlded by base class
export const errorMessage = (
  cmd: Command,
  tagLine: string,
  e: unknown,
  options = {exit: false}
) => {
  console.log('-- FROM USER FEEDBACK');
  const error = isAxiosError(e)
    ? new APIError(e, tagLine)
    : new UnknownError(e);

  if (options.exit) {
    throw error;
  } else {
    cmd.warn(error.message);
  }
};
