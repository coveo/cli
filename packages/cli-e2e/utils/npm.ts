import {resolve} from 'path';
export const npm = () => ['node', resolve(process.env['npm_execpath']!)];
