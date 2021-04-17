import {appendCmdIfWindows} from '../../utils/os';
import {getBinVersionPrecondition} from './binPreconditionsFactory';

export const IsNpmVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`npm`,
  {prettyName: 'npm'}
);
