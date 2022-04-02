import {readdirSync} from 'fs';
import {join} from 'path';

export interface FilesOrFolders {
  file?: string[];
  folder?: string[];
}

export async function getFileNames(entries: FilesOrFolders) {
  let fileNames: string[] = [];
  if (entries.file) {
    fileNames = fileNames.concat(entries.file);
  }
  if (entries.folder) {
    const isString = (file: string | null): file is string => Boolean(file);
    fileNames = fileNames.concat(
      entries.folder
        .flatMap((folder) =>
          readdirSync(folder, {withFileTypes: true}).map((dirent) =>
            dirent.isFile() ? join(folder, dirent.name) : null
          )
        )
        .filter(isString)
    );
  }
  return fileNames;
}
