import {Command} from '@oclif/core';
import {green} from 'chalk';
import dedent from 'ts-dedent';
import {wrapError} from '@coveo/cli-commons/errors/wrapError';

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

export const errorMessage = (
  cmd: Command,
  tagLine: string,
  e: unknown,
  options = {exit: false}
) => {
  const error = wrapError(e);
  error.message = dedent`${tagLine}
  ${error.message}`;

  if (options.exit) {
    throw error;
  } else {
    cmd.warn(error.message);
  }
};
