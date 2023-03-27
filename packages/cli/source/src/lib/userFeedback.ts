import {green} from 'chalk';
import dedent from 'ts-dedent';
import {wrapError} from '@coveo/cli-commons/errors/wrapError';
import {CliUx} from '@oclif/core';
import type {Response} from 'undici';
import {errors} from '@coveo/push-api-client';

export const successMessage = (tagLine: string, res?: Response) => {
  let message = dedent(`
      ${tagLine}
      `);
  if (res) {
    message += `Status code: ${green(res.status, res.statusText)}
    `;
  }
  CliUx.ux.log(message);
};

export const errorMessage = (
  tagLine: string,
  e: unknown,
  options = {exit: false}
) => {
  const error = e instanceof errors.FetchError ? e : wrapError(e);
  error.message = dedent`${tagLine}
  ${error.message}`;

  if (options.exit) {
    throw error;
  } else {
    CliUx.ux.warn(error.message);
  }
};
