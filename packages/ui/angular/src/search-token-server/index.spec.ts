import {join} from 'path';
import {Schema as WorkspaceOptions} from '@schematics/angular/workspace/schema';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {CoveoSchema} from '../schema';

describe('search-token-server', () => {
  const projectName = 'foo';

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '0.0.0',
  };

  const defaultSchemaOptions: CoveoSchema = {
    orgId: 'fake-org-id',
    apiKey: 'my-fake-api-key',
    name: 'MyTestProject',
    project: projectName,
    user: 'alicesmith@example.com',
  };

  const appOptions: ApplicationOptions = {
    name: projectName,
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Css,
    skipTests: false,
    skipPackageJson: false,
  };
  const runSearchTokenServerSchematic = async () => {
    return runner.runSchematic(
      'search-token-server',
      {...defaultSchemaOptions},
      appTree
    );
  };
  const collectionPath = join(__dirname, '../collection.json');
  const runner = new SchematicTestRunner('schematics', collectionPath);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await runner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
    appTree = await runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    );
  });

  it('should add a server directory', async () => {
    const tree = await runSearchTokenServerSchematic();
    expect(tree.files).toContain('/server/server.ts');
  });
});
