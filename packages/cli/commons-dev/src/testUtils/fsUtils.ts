import {Dirent} from 'fs';

export const getFile = (name: string) => getDirent(name, 'file');
export const getDirectory = (name: string) => getDirent(name, 'dir');

const getDirent = (name: string, type: 'file' | 'dir') => {
  const dirent = new Dirent();
  const isFile = type === 'file';
  dirent.isDirectory = isFile ? () => false : () => true;
  dirent.isFile = isFile ? () => true : () => false;
  if (name) {
    dirent.name = name;
  }
  return dirent;
};
