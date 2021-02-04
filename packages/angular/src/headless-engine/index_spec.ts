// import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import {CoveoSchema} from './schema';

describe('headless-engine', () => {
  const collectionPath = path.join(__dirname, '../collection.json');
  // const schematicRunner = new SchematicTestRunner('schematics', path.join(__dirname, './../collection.json'));

  // const workspaceOptions: any = {
  //   name: 'workspace',
  //   newProjectRoot: 'projects',
  //   version: '0.5.0',
  // };

  // const appOptions: any = {
  //   name: 'schematest',
  // };

  const schemaOptions: CoveoSchema = {
    orgId: 'xxx',
    apiKey: '1234',
  };

  let appTree: UnitTestTree;

  // beforeEach(() => {
  //   appTree = schematicRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions);
  //   appTree = schematicRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree);
  // });

  // it('works', async () => {
  //   const runner = new SchematicTestRunner('schematics', collectionPath);
  //   const tree = await runner.runSchematicAsync('headless-engine', {}, Tree.empty()).toPromise();

  //   expect(tree.files).toEqual(['/hello.ts']);
  // });

  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    runner
      .runSchematicAsync('headless-engine', schemaOptions, appTree)
      .toPromise()
      .then((tree) => {
        expect(tree.files).toEqual(['/hello.ts']);
        // TODO: create a real component like below
        // const appComponent = tree.readContent('/projects/schematest/src/app/app.component.ts');
        // expect(appComponent).toContain(`name = '${schemaOptions.name}'`);
      });
  });
});
