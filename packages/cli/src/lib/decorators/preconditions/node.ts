import {getBinVersionPrecondition} from './binPreconditionsFactory.js';

export const IsNodeVersionInRange = getBinVersionPrecondition('node', {
  prettyName: 'Node.js',
});
