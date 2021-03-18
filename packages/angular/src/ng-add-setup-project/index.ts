import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {Rule, Tree, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {createFiles} from '../common-rules/templates';
import {runPackageInstallTask} from '../common-rules/dependencies';
import {updateNgModule} from './rules/ng-module';
import {addMaterialAngular, addToPackageJson} from './rules/dependencies';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    return chain([
      addMaterialAngular(options),
      createFiles(options),
      updateNgModule(options, project),
    ]);
  };
}

export function setupDependencies(options: CoveoSchema): Rule {
  return () =>
    chain([
      addToPackageJson('@angular/material'),
      addToPackageJson('@coveo/headless'),
      addToPackageJson('@coveo/search-token-server'),
      addToPackageJson('concurrently'),
      runPackageInstallTask(),
    ]);
}
