import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {CoveoSchema} from './schema';

export default function (_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const {orgId, apiKey} = _options;
    tree.create('hello.ts', `console.log("dsadsadsa, ${orgId} - ${apiKey}")`);
    return tree;
  };
}
