import {CliUx} from '@oclif/core';

export interface FilesOrFolders {
  file?: string[]; // TODO: CDX-856: remove flag
  folder?: string[]; // TODO: CDX-856: remove flag
  files?: string[];
}

export async function getFileNames(entries: FilesOrFolders) {
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
