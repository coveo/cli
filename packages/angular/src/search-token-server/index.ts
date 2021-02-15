import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {createFiles} from '../rules/templates';
import {addProxyToWorkspace} from '../rules/workspace';
import {dirname} from 'path';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      const searchTokenServeTemplate = dirname(
        // eslint-disable-next-line node/no-extraneous-require
        // TODO: need to merge #33
        require.resolve('@coveo/search-token-server')
      );

      return chain([
        createFiles(options, './server', searchTokenServeTemplate),
        // createFilesToken(options),
        addProxyToWorkspace(options, project),
      ]);
    }
    return;
  };
}
