import {green} from 'chalk';
import dedent from 'ts-dedent';
import {wrapError} from '@coveo/cli-commons/errors/wrapError';

export interface AxiosResponse {
  status: number;
  statusText: string;
}

export const successMessage = (tagLine: string, res?: AxiosResponse) => {
  let message = dedent(`
      ${tagLine}
      `);
  if (res) {
    message += `Status code: ${green(res.status, res.statusText)}
    `;
  }
  return message;
};

export const errorMessage = (tagLine: string, e: unknown) => {
  const error = wrapError(e);
  error.message = dedent`${tagLine}
  ${error.message}`;
  return error.message;
};
