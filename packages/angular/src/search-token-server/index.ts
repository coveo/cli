import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {
  addProxyConfigToWorkspace,
  startProxyServerFromRootApp,
} from './rules/proxy';
import {createServerDirectory} from './rules/templates';
import {installServerDependencies} from './rules/dependencies';
import {createFiles} from '../common-rules/templates';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([
        addProxyConfigToWorkspace(options, project),
        createServerDirectory(options),
        createFiles(options),
        startProxyServerFromRootApp(options),
        installServerDependencies(options),
      ]);
    }
    return;
  };
}
