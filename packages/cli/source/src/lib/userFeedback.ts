import {green} from 'chalk';
import dedent from 'ts-dedent';
import {wrapError} from '@coveo/cli-commons/errors/wrapError';
import {CliUx} from '@oclif/core';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';

export interface AxiosResponse {
  status: number;
  statusText: string;
}

export const successMessage = (
  tagLine: string,
  options: {res?: AxiosResponse; remaining?: number}
) => {
  const plurableDoc: Plurable = ['document', 'documents'];
  const {res, remaining} = options;
  let message = tagLine;
  if (res) {
    message += ` | Status code: ${green(res.status, res.statusText)}`;
  }
  if (remaining && remaining > 0) {
    message += ` | ${green(remaining)} remaining ${pluralizeIfNeeded(
      plurableDoc,
      remaining
    )}`;
  }
  CliUx.ux.log(message);
};

export const errorMessage = (
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
    CliUx.ux.warn(error.message);
  }
};
