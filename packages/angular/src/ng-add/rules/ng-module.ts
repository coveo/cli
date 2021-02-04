import {addDeclarationToModule} from '@angular/cdk/schematics';
import {basename, dirname, join} from 'path';
import {classify} from '@angular-devkit/core/src/utils/strings';
import {CoveoSchema} from '../schema';
import {createSourceFile, ScriptTarget} from 'typescript';
import {getAppModulePath, getProjectMainFile} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {Rule, Tree} from '@angular-devkit/schematics';
import {SourceFile} from 'typescript';

export function updateNgModule(
  _options: CoveoSchema,
  _project: ProjectDefinition
): Rule {
  return (tree: Tree) => {
    const appModulePath = getAppModulePath(tree, getProjectMainFile(_project));

    const appModuleContent =
      tree.get(appModulePath)?.content.toString() ||
      getDefaultAppModuleContent();
    const source = createSourceFile(
      appModulePath,
      appModuleContent,
      ScriptTarget.Latest,
      true
    );
    const updateRecorder = tree.beginUpdate(appModulePath);

    // Add all Coveo components here
    const changes = getAllComponentsToInject(tree, source, appModulePath);

    // Inserting declarations
    changes.map((change) => {
      if (change instanceof InsertChange) {
        updateRecorder.insertLeft(change.pos, change.toAdd);
      }
    });

    tree.commitUpdate(updateRecorder);

    return tree;
  };
}

function getDefaultAppModuleContent() {
  return `import { BrowserModule } from '@angular/platform-browser';
    import { NgModule } from '@angular/core';
    import { AppComponent } from './app.component';
    // Default app module content

    @NgModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule
      ],
      providers: [],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    `;
}

function getAllComponentsToInject(
  tree: Tree,
  source: SourceFile,
  appModulePath: string
) {
  const changes: InsertChange[] = [];

  tree.actions
    .filter((action) => {
      // Filter out non TS files
      const splitted = action.path.split('.');
      return splitted.indexOf('ts') !== -1 && splitted.indexOf('spec') === -1;
    })
    .map((action) => {
      if (action.kind === 'c') {
        // If the file needs to be added to the tree, then it should be added to the ng Module
        const filePath = join('./files', dirname(action.path));
        const filePathArray = filePath.split('/');
        const componentName = filePathArray[filePathArray.length - 1];

        const fileLocation = `./${componentName}/${basename(
          action.path,
          '.ts'
        )}`;

        changes.push(
          ...(addDeclarationToModule(
            source,
            appModulePath,
            `${classify(componentName)}Component`,
            fileLocation
          ) as InsertChange[])
        );
      }
    });
  return changes;
}
