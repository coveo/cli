import {ux} from '@oclif/core';

export interface FilesOrFolders {
  file?: string[]; // TODO: CDX-856: remove flag
  folder?: string[]; // TODO: CDX-856: remove flag
  files?: string[];
}

export function getFileNames(entries: FilesOrFolders, commandName: string) {
  // TODO: CDX-856: only read --files flag
  const entryNames = [
    ...(entries.file ?? []),
    ...(entries.folder ?? []),
    ...(entries.files ?? []),
  ];

  if (entryNames.length === 0) {
    ux.error(
      `You must set the \`files\` flag. Use \`${commandName} --help\` to get more information.`
    );
  }

  return entryNames;
}
