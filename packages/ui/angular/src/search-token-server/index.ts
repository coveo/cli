import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {createServerDirectory} from './rules/templates';
import {installServerDependencies} from './rules/dependencies';
import {createFiles} from '../common-rules/templates';
import {getProjectFromWorkspace} from '../common-rules/project';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([
        createServerDirectory(options),
        createFiles(options),
        installServerDependencies(options),
      ]);
    }
    return;
  };
}
