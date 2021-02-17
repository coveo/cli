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
  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '0.0.0',
  };

  const defaultSchemaOptions: CoveoSchema = {
    orgId: 'fake-org-id',
    apiKey: 'my-fake-api-key',
    name: 'MyTestProject',
  };

  const appOptions: ApplicationOptions = {
    name: 'foo',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Css,
    skipTests: false,
    skipPackageJson: false,
  };
  const runSearchTokenServerSchematic = async () => {
    return await runner
      .runSchematicAsync(
        'search-token-server',
        {...defaultSchemaOptions},
        appTree
      )
      .toPromise();
  };
  const collectionPath = join(__dirname, '../collection.json');
  const runner = new SchematicTestRunner('schematics', collectionPath);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
  });

  it('should add a proxy config file', async () => {
    const tree = await runSearchTokenServerSchematic();
    expect(tree.files).toContain('/src/proxy.conf.json');
  });

  it('should add a server directory', async () => {
    const tree = await runSearchTokenServerSchematic();
    expect(tree.files).toContain('/server/server.ts');
  });

  it('should add a .env file in the server directory', async () => {
    const tree = await runSearchTokenServerSchematic();
    expect(tree.files).toContain('/server/.env');
    const envContent = tree.readContent('/server/.env');
    expect(
      envContent.indexOf('ORGANIZATION_ID=fake-org-id')
    ).toBeGreaterThanOrEqual(0);
    expect(
      envContent.indexOf('API_KEY=my-fake-api-key')
    ).toBeGreaterThanOrEqual(0);
    expect(
      envContent.indexOf('PLATFORM_URL=https://platform.cloud.coveo.com')
    ).toBeGreaterThanOrEqual(0);
  });
});
