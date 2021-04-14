import {getBinVersionPrecondition} from './binPreconditionsFactory';

export const IsNodeVersionInRange = getBinVersionPrecondition('node', {
  prettyName: 'Node.js',
});
