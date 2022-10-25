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
// export const successMessage = (tagLine: string, res?: AxiosResponse) => {
//   const messageParts: string[] = [tagLine];
//   if (res) {
//     messageParts.push(`Status code: ${green(res.status, res.statusText)}`);
//   }
//   return messageParts.join(' | ');
// };

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
    return error.message;
  }
};
