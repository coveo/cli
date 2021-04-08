import {getBinVersionDecorator} from './binVersionDecoratorFactory';

export const IsNodeVersionInRange = getBinVersionDecorator('node', {
  prettyName: 'Node.js',
});
