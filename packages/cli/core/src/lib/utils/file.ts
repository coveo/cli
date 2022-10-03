import {readdirSync} from 'fs';
import {extname, join} from 'path';

export function fileDepthSearch(
  dirPath: string,
  fileExtension = '.json'
): string[] {
  const filePaths: string[] = [];
  const files = readdirSync(dirPath, {withFileTypes: true});
  for (const file of files) {
    const filePath = join(dirPath, file.name);
    if (file.isDirectory()) {
      filePaths.push(...fileDepthSearch(filePath));
    }
    if (file.isFile() && extname(filePath) === fileExtension) {
      filePaths.push(filePath);
    }
  }

  return filePaths;
}
