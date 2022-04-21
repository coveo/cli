import {readdirSync, statSync} from 'fs';
import {join} from 'path';

export interface FilesOrFolders {
  file?: string[];
  folder?: string[];
}

export async function getFileNames(entries: FilesOrFolders) {
  return [...(entries.file ?? []), ...(entries.folder ?? [])].flatMap(
    getFilenamesRecursively
  );
}
function getFilenamesRecursively(entry: string): string[] {
  const entryStat = statSync(entry, {throwIfNoEntry: false});
  if (!entryStat) {
    return [];
  }
  if (entryStat.isDirectory()) {
    return readdirSync(entry, {withFileTypes: true}).flatMap((subEntry) => {
      const subEntryPath = join(entry, subEntry.name);
      return subEntry.isDirectory()
        ? getFilenamesRecursively(subEntryPath)
        : [subEntryPath];
    });
  }
  if (entryStat.isFile()) {
    return [entry];
  }
  return [];
}
