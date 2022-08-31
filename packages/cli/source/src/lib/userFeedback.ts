import {Command} from '@oclif/core';
import {green} from 'chalk';
import dedent from 'ts-dedent';
import {APIError, isAxiosError} from '@coveo/cli-commons/src/errors/apiError';
import {UnknownError} from '@coveo/cli-commons/src/errors/unknownError';

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
