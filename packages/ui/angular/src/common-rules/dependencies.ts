import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {CoveoSchema} from '../schema';
import {normalize} from '@angular-devkit/core';

export function runPackageInstallTask(workingDirectory?: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const cfg = workingDirectory ? {workingDirectory} : {};
    context.addTask(new NodePackageInstallTask(cfg), []);
  };
}

export function allowCommonJsDependencies(options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceBuffer = tree.read(normalize('./angular.json'));
    if (workspaceBuffer === null || !options.project) {
      return;
    }
    try {
      const workspaceConfig = JSON.parse(workspaceBuffer.toString());

      const allowedCommonJsDependencies =
        workspaceConfig.projects[options.project].architect.build.options[
          'allowedCommonJsDependencies'
        ] || [];

      allowedCommonJsDependencies.push('@coveo/headless');

      workspaceConfig.projects[options.project].architect.build.options[
        'allowedCommonJsDependencies'
      ] = allowedCommonJsDependencies;

      tree.overwrite(
        normalize('./angular.json'),
        JSON.stringify(workspaceConfig, null, 4)
      );
    } catch (error) {
      console.error(
        `Unable to update the Angular workspace configuration by adding @coveo/headless as a "allowedCommonJsDependencies".
Make sure your angular.json file is valid and contains a "build" target (see https://angular.io/guide/glossary#target).`,
        error
      );
    }
  };
}
