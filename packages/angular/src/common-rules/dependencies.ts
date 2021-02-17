import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';

export function runPackageInstallTask(workingDirectory?: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const cfg = workingDirectory ? {workingDirectory} : {};
    context.addTask(new NodePackageInstallTask(cfg), []);
  };
}
