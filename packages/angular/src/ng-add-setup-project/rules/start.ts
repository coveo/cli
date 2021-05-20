import {normalize} from '@angular-devkit/core';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {CoveoSchema} from '../../schema';

/**
 * Create a npm script in the project root to start both the Angular app and the proxy server
 */
export function configureStartCommand(_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJsonBuffer = tree.read(normalize('./package.json'));
    if (packageJsonBuffer === null) {
      return;
    }

    try {
      const packageJson = JSON.parse(packageJsonBuffer.toString());

      packageJson.scripts['allocate-port'] = 'node ./scripts/port-allocator.js';
      packageJson.scripts['start'] =
        'npm run allocate-port && concurrently --raw "npm run start-server" "ng serve"';
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
