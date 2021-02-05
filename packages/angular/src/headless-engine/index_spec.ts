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

describe('headless-engine', () => {
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

  it('should create the Coveo Headless Engine', async () => {
    const schemaOptions = {...defaultSchemaOptions};
    const tree = await runner
      .runSchematicAsync('headless-engine', schemaOptions, appTree)
      .toPromise();

    const packageJsonContent = tree.readContent('/package.json');
    // The coveo headless dependency was added to package.json
    expect(Object.keys(JSON.parse(packageJsonContent).dependencies)).toContain(
      '@coveo/headless'
    );

    // The headless engine was added to the angular project
    expect(tree.files).toContain('/src/app/engine.ts');
  });
  // TODO: check if the org ID and api key was added to the engine
});
