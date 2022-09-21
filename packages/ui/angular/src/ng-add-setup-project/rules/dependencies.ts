import {
  externalSchematic,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {CoveoSchema} from '../../schema';

export function addToPackageJson(
  packageName: string,
  version = 'latest'
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageToAdd: NodeDependency = {
      type: NodeDependencyType.Default,
      name: packageName,
      version,
      overwrite: true,
    };

    addPackageJsonDependency(tree, packageToAdd);
  };
}

export function addMaterialAngular(_options: CoveoSchema): Rule {
  console.log('\nConfigure your Material Project');
  // For more information about @angular/material schema options:
  // https://github.com/angular/components/blob/e99ca0ac9b0088d20d5d680092cd7ea5624934c0/src/material/schematics/ng-add/schema.json
  return externalSchematic('@angular/material', 'install', _options);
}
