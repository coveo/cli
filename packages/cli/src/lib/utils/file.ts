import {PathLike} from 'fs';

export const isDotFile = (documentPath: PathLike) => {
  return documentPath.toString().startsWith('.');
};
