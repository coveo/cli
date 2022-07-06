import {CliUx} from '@oclif/core';
import {lstatSync, PathLike, readdirSync} from 'fs';
import {join} from 'path';

export interface FilesOrFolders {
  file?: string[]; // TODO: CDX-856: remove flag
  folder?: string[]; // TODO: CDX-856: remove flag
  files?: string[];
}

export async function getFileNames(entries: FilesOrFolders) {
  // TODO: CDX-856: only read --files flag
  const entryNames = [
    ...(entries.file ?? []),
    ...(entries.folder ?? []),
    ...(entries.files ?? []),
  ];

  if (entryNames.length === 0) {
    CliUx.ux.error(
      'You must set the `files` flag. Use `source:push:add --help` to get more information.'
    );
  }

  return entryNames;
}

// TODO: delete and export the same method in push-api-client instead
export const isJsonFile = (documentPath: PathLike) => {
  return documentPath.toString().endsWith('.json');
};

export const getAllJsonFilesFromEntries = (
  filesOrDirectories: string[],
  fileNames: string[] = []
): string[] => {
  const uniqueFileNames: string[] = [];

  filesOrDirectories.flatMap((entry) => {
    if (lstatSync(entry).isDirectory()) {
      recursiveDirectoryRead(entry, fileNames);
    } else {
      fileNames.push(entry);
    }
  });

  for (const file of fileNames) {
    if (!uniqueFileNames.includes(file) && isJsonFile(file)) {
      uniqueFileNames.push(file);
    }
  }

  return uniqueFileNames;
};

const recursiveDirectoryRead = (folder: string, accumulator: string[] = []) => {
  readdirSync(folder, {withFileTypes: true}).map((dirent) => {
    if (dirent.isDirectory()) {
      recursiveDirectoryRead(join(folder, dirent.name), accumulator);
    } else if (dirent.isFile()) {
      accumulator.push(join(folder, dirent.name));
    }
  });
};
