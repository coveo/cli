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
import {configureStartCommand} from './rules/start';

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
      addToPackageJson('@angular/material', '~13.0.0'),
      addToPackageJson('@coveo/headless', 'alpha'),
      addToPackageJson('@coveo/search-token-server'),
      addToPackageJson('get-port', '^5.1.1'),
      addToPackageJson('dotenv', '^8.6.0'),
      addToPackageJson('concurrently'),
      runPackageInstallTask(),
      allowCommonJsDependencies(_options),
      configureStartCommand(_options),
    ]);
}
