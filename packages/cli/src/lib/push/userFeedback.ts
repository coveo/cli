import {Command} from '@oclif/core';
import chalk from 'chalk';
import {validate} from 'jsonschema';
import {dedent} from 'ts-dedent';
import {
  APIError,
  AxiosErrorFromAPI,
  AxiosErrorFromAPISchema,
} from '../errors/APIError.js';
import {UnknownError} from '../errors/unknownError.js';

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
    message += `Status code: ${chalk.green(res.status, res.statusText)}
    `;
  }
  cmd.log(message);
};

export const errorMessage = (
  cmd: Command,
  tagLine: string,
  e: unknown,
  options = {exit: false}
) => {
  const error = isErrorFromAPI(e)
    ? new APIError(e, tagLine)
    : new UnknownError(e);

  if (options.exit) {
    throw error;
  } else {
    cmd.warn(error.message);
  }
};

function isErrorFromAPI(error: unknown): error is AxiosErrorFromAPI {
  return validate(error, AxiosErrorFromAPISchema).valid;
}
