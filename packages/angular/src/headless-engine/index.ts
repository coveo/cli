import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {createFiles} from '../rules/templates';
import {installDepedencies} from '../rules/dependencies';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([installDepedencies(options), createFiles(options)]);
    }
    return;
  };
}
