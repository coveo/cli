import {PathLike} from 'fs';
import {CLIBaseError} from '../errors/CLIBaseError';

export class NotAFileError extends CLIBaseError {
  public constructor(p: PathLike) {
    super(`${p} is not a valid file, or does not exists.`);
  }
}

export class InvalidDocument extends CLIBaseError {
  public constructor(p: PathLike, explanation: string) {
    super(`${p} is not a valid JSON document: ${explanation}`);
  }
}

export class UnsupportedAttribute extends CLIBaseError {
  public constructor(p: PathLike, unsupported: string) {
    super(
      `${p} contains a currently unsupported document attribute: ${unsupported}`
    );
  }
}
