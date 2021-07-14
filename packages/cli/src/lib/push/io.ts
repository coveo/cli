import {existsSync, lstatSync, PathLike, readFileSync} from 'fs';

export function isDirectory(p: PathLike) {
  if (!existsSync(p)) {
    return false;
  }
  return lstatSync(p).isDirectory();
}

export function isFile(p: PathLike) {
  if (!existsSync(p)) {
    return false;
  }
  return lstatSync(p).isFile();
}

export function fileSize(p: PathLike) {
  return lstatSync(p).size;
}

export function loadFile(p: PathLike) {
  return readFileSync(p).toString();
}
