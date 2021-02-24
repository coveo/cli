import {
  addDeclarationToModule,
  addImportToModule,
} from '@angular/cdk/schematics';
import {basename, dirname} from 'path';
import {classify} from '@angular-devkit/core/src/utils/strings';
import {createSourceFile, ScriptTarget} from 'typescript';
import {getAppModulePath, getProjectMainFile} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {Action, Rule, Tree} from '@angular-devkit/schematics';
import {SourceFile} from 'typescript';
import {CoveoSchema} from '../schema';

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

    const changes = [
      ...getAllCoveoComponentsToInject(tree, source, appModulePath),
      ...injectMaterialImports(source, appModulePath),
    ];

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

function isTypeScriptSourceFile(action: Action) {
  const splitted = action.path.split('.');
  return splitted.indexOf('ts') !== -1 && splitted.indexOf('spec') === -1;
}

function isCreateAction(action: Action) {
  return action.kind === 'c';
}

function getAllCoveoComponentsToInject(
  tree: Tree,
  source: SourceFile,
  appModulePath: string
) {
  const changes: InsertChange[] = [];

  tree.actions
    .filter(isTypeScriptSourceFile)
    .filter(isCreateAction)
    .map((action) => {
      const componentName = basename(dirname(action.path));
      const fileLocation = `./${componentName}/${basename(action.path, '.ts')}`;

      changes.push(
        ...(addDeclarationToModule(
          source,
          appModulePath,
          `${classify(componentName)}Component`,
          fileLocation
        ) as InsertChange[])
      );
    });
  return changes;
}

export function injectMaterialImports(
  source: SourceFile,
  appModulePath: string
) {
  const modules = {
    MatAutocompleteModule: '@angular/material/autocomplete',
    MatFormFieldModule: '@angular/material/form-field',
    ReactiveFormsModule: '@angular/forms',
    MatInputModule: '@angular/material/input',
    MatListModule: '@angular/material/list',
    MatPaginatorModule: '@angular/material/paginator',
    MatSelectModule: '@angular/material/select',
    MatButtonModule: '@angular/material/button',
  };

  const changes: InsertChange[] = [];

  Object.entries(modules).map(([key, value]) =>
    changes.push(
      ...(addImportToModule(
        source,
        appModulePath,
        key,
        value
      ) as InsertChange[])
    )
  );

  return changes;
}
