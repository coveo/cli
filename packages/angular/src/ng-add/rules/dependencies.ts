import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

export function installDepedencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const headlessDependency: NodeDependency = {
      type: NodeDependencyType.Default,
      name: '@coveo/headless',
      version: 'latest',
      overwrite: true,
    };

    addPackageJsonDependency(tree, headlessDependency);

    // Installing Coveo headless package
    context.addTask(new NodePackageInstallTask(), []);
  };
}
