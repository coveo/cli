import {Dirent} from 'fs';

export const getFile = (name: string) => getDirent(name, 'file');
export const getDirectory = (name: string) => getDirent(name, 'dir');

const getDirent = (name: string, type: 'file' | 'dir'): Dirent<any> => {
  const dirent = new Dirent() as Dirent<any>;
  const isFile = type === 'file';
  dirent.isDirectory = () => !isFile;
  dirent.isFile = () => isFile;
  dirent.name = name;
  return dirent;
};
