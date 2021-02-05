import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, SchematicContext} from '@angular-devkit/schematics';

import {RunSchematicTask} from '@angular-devkit/schematics/tasks';
import {CoveoSchema} from '../schema';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      const taskId = context.addTask(
        new RunSchematicTask('headless-engine', options)
      );
      context.addTask(new RunSchematicTask('ng-add-setup-project', options), [
        taskId,
      ]);
    }
    return;
  };
}
