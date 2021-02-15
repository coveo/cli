import {normalize} from '@angular-devkit/core';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {CoveoSchema} from '../schema';

export function addProxyToWorkspace(
  options: CoveoSchema,
  _project: ProjectDefinition
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspaceBuffer = tree.read(normalize('./angular.json'));
    if (workspaceBuffer !== null && options.project) {
      try {
        const workspaceConfig = JSON.parse(workspaceBuffer.toString());

        workspaceConfig.projects[options.project].architect.serve.options[
          'proxyConfig'
        ] = 'src/proxy.conf.json';

        tree.overwrite(
          './angular.json',
          JSON.stringify(workspaceConfig, null, 4)
        );
      } catch (error) {
        console.error('Unable to add proxy to project workspace', error);
      }
    }
  };
}
