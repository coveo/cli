import Command from '@oclif/command';
import {green, red} from 'chalk';
import dedent from 'ts-dedent';

export interface ErrorFromAPI {
  response: {
    status: number;
    data: {
      errorCode: string;
      message: string;
    };
  };
}

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
  e: ErrorFromAPI
) => {
  cmd.warn(
    dedent(`
    ${tagLine}
    Status code: ${red(e.response.status)}
    Error code: ${red(e.response.data.errorCode)}
    Message: ${red(e.response.data.message)}
    `)
  );
};
