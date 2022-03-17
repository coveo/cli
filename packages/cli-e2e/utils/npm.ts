import {resolve} from 'path';
export const npm = () => [
  'node',
  process.env['npm_execpath']
    ? resolve(process.env['npm_execpath'])
    : require.resolve('npm'),
];
