import {
  externalSchematic,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {CoveoSchema} from '../schema';

export function installDepedencies(_options: CoveoSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const headlessDependency: NodeDependency = {
      type: NodeDependencyType.Default,
      name: '@coveo/headless',
      version: 'latest',
      overwrite: true,
    };
    const materialDependency: NodeDependency = {
      type: NodeDependencyType.Default,
      name: '@angular/material',
      version: 'latest',
      overwrite: true,
    };

    addPackageJsonDependency(tree, headlessDependency);
    addPackageJsonDependency(tree, materialDependency);

    // Installing Coveo headless and Angular Material packages
    context.addTask(new NodePackageInstallTask(), []);
  };
}

export function addMaterialAngular(_options: CoveoSchema): Rule {
  console.log('\nConfigure your Material Project');
  // For more information about @angular/material schema options:
  // https://github.com/angular/components/blob/e99ca0ac9b0088d20d5d680092cd7ea5624934c0/src/material/schematics/ng-add/schema.json
  return externalSchematic('@angular/material', 'install', _options);
}
