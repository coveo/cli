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
  if (isErrorFromAPI(e)) {
    const apiError = new APIError(e, tagLine);
    if (options.exit) {
      throw apiError;
    } else {
      cmd.warn(apiError.message);
    }
  } else {
    throw new UnknownError(e);
  }
};

function isErrorFromAPI(error: unknown): error is AxiosErrorFromAPI {
  return validate(error, AxiosErrorFromAPISchema).valid;
}
