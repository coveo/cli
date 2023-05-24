import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {getBinVersionPrecondition} from './binPreconditionsFactory';

export const IsNpmVersionInRange = getBinVersionPrecondition(
  appendCmdIfWindows`npm`,
  {prettyName: 'npm'}
);
