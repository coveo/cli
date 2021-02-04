import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {Rule, Tree, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from './schema';
import {updateNgModule} from './rules/ng-module';
import {installDepedencies} from './rules/dependencies';
import {addHeadlessComponents} from './rules/templates';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([
        addHeadlessComponents(options, project),
        updateNgModule(options, project),
        installDepedencies(),
      ]);
    }

    return;
  };
}
