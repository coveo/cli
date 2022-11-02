import {green} from 'chalk';
import dedent from 'ts-dedent';
import {wrapError} from '@coveo/cli-commons/errors/wrapError';
import {CliUx} from '@oclif/core';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';

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

  // TODO: add the progress bar from cli-CliUx
  // we don't care about the files
  // but what if a batch is not accepted by the API. C<est pour ca qu'on va utiliser le multibar et seulement logger  en haut les erreurs :D NICE!!!!
  CliUx.ux.log(message);
};

export const errorMessage = (tagLine: string, e: unknown) => {
  const error = wrapError(e);
  error.message = dedent`${tagLine}
  ${error.message}`;

  return error.message;
  // TODO: update function consumer
};
