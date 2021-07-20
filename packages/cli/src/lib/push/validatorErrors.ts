import {PathLike} from 'fs';

export class NotAFileError extends Error {
  public constructor(p: PathLike) {
    super(`${p} is not a valid file, or does not exists.`);
  }
}

export class InvalidDocument extends Error {
  public constructor(p: PathLike, explanation: string) {
    super(`${p} is not a valid JSON document: ${explanation}`);
  }
}

export class UnsupportedAttribute extends Error {
  public constructor(p: PathLike, unsupported: string) {
    super(
      `${p} contains a currently unsupported document attribute: ${unsupported}`
    );
  }
}
