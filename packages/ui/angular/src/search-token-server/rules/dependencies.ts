import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {CoveoSchema} from '../../schema';

export function installServerDependencies(_options: CoveoSchema): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask({workingDirectory: './server'}));
  };
}
