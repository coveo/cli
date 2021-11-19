import Command from '@oclif/command';
import {green} from 'chalk';
import {validate} from 'jsonschema';
import dedent from 'ts-dedent';
import {
  APIError,
  AxiosErrorFromAPI,
  AxiosErrorFromAPISchema,
} from '../errors/APIError';
import {UnknownError} from '../errors/unknownError';

export interface AxiosResponse {
  status: number;
  statusText: string;
}

export const successMessage = (
  cmd: Command,
  tagLine: string,
  res: AxiosResponse
) => {
  cmd.log(
    dedent(`
      ${tagLine}
      Status code: ${green(res.status, res.statusText)}
      `)
  );
};

export const errorMessage = (
  cmd: Command,
  tagLine: string,
  e: Error,
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
