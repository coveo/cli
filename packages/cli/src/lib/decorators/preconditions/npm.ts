import {appendCmdIfWindows} from '../../utils/os.js';
import {getBinVersionPrecondition} from './binPreconditionsFactory.js';

export const IsNpmVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`npm`,
  {prettyName: 'npm'}
);
