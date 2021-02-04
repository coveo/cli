import {classify} from '@angular-devkit/core/src/utils/strings';
import {Tree} from '@angular-devkit/schematics';
import {addDeclarationToModule} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {basename, dirname, join} from 'path';
import {SourceFile} from 'typescript';

export function getDefaultAppModuleContent() {
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

export function getAllComponentsToInject(
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
