import type {PathLike} from 'fs';

export const isJsonFile = (documentPath: PathLike) => {
  return documentPath.toString().endsWith('.json');
};
