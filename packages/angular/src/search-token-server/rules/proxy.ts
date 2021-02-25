import {normalize} from '@angular-devkit/core';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {CoveoSchema} from '../../schema';

/**
 * Create a proxy config file in the Angular project
 */
export function addProxyConfigToWorkspace(
  options: CoveoSchema,
  _project: ProjectDefinition
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceBuffer = tree.read(normalize('./angular.json'));
    if (workspaceBuffer === null || !options.project) {
      return;
    }
    try {
      const workspaceConfig = JSON.parse(workspaceBuffer.toString());

      workspaceConfig.projects[options.project].architect.serve.options[
        'proxyConfig'
      ] = 'src/proxy.conf.json';

      tree.overwrite(
        normalize('./angular.json'),
        JSON.stringify(workspaceConfig, null, 4)
      );
    } catch (error) {
      console.error(
        `Unable to update the Angular workspace configuration with the proxy information.
Make sure your angular.json file is valid and contains a "serve" target (see https://angular.io/guide/build#proxying-to-a-backend-server).`,
        error
      );
    }
  };
}

/**
 * Create a npm script in the project root to start both the Angular app and the proxy server
 */
export function startProxyServerFromRootApp(_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJsonBuffer = tree.read(normalize('./package.json'));
    if (packageJsonBuffer === null) {
      return;
    }

    try {
      const packageJson = JSON.parse(packageJsonBuffer.toString());

      packageJson.scripts['start'] =
        'concurrently "npm run start-server" "ng serve"';
      packageJson.scripts['start-server'] = 'node ./scripts/start-server.js';

      tree.overwrite(
        normalize('./package.json'),
        JSON.stringify(packageJson, null, 4)
      );
    } catch (error) {
      console.error('Unable to add proxy to project workspace', error);
    }
  };
}
