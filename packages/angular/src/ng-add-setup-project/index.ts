import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {Rule, Tree, chain} from '@angular-devkit/schematics';

import {CoveoSchema} from '../schema';
import {createFiles} from '../common-rules/templates';
import {
  allowCommonJsDependencies,
  runPackageInstallTask,
} from '../common-rules/dependencies';
import {updateNgModule} from './rules/ng-module';
import {addMaterialAngular, addToPackageJson} from './rules/dependencies';
import {updateTsConfig} from './rules/tsconfig';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    return chain([
      addMaterialAngular(options),
      createFiles(options),
      updateNgModule(options, project),
      updateTsConfig(options),
    ]);
  };
}

export function setupDependencies(_options: CoveoSchema): Rule {
  return () =>
    chain([
      addToPackageJson('@angular/material', '^11.2.11'),
      addToPackageJson('@coveo/headless'),
      addToPackageJson('@coveo/search-token-server'),
      addToPackageJson('concurrently'),
      runPackageInstallTask(),
      allowCommonJsDependencies(_options),
    ]);
}
