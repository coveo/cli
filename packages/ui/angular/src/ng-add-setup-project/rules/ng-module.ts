import {addImportToModule} from '@schematics/angular/utility/ast-utils';
import {getAppModulePath} from '@schematics/angular/utility/ng-ast-utils';
import type {ProjectDefinition} from '@schematics/angular/utility/workspace';
import {InsertChange} from '@schematics/angular/utility/change';
import {Rule, Tree} from '@angular-devkit/schematics';
import {CoveoSchema} from '../../schema';
import {
  createSourceFile,
  ScriptTarget,
  SourceFile,
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

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

    const changes = getAdditionalImports(source, appModulePath);

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

export function getAdditionalImports(
  source: SourceFile,
  appModulePath: string
) {
  const modules = {
    AppRoutingModule: './app-routing.module',
    CoveoComponentsModule: './coveo.components.module',
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

function getProjectMainFile(project: ProjectDefinition) {
  const mainFile =
    project.targets.get('build')?.options?.['main'] ??
    project.targets.get('browser')?.options?.['main'];

  if (typeof mainFile !== 'string') {
    throw new Error('Could not determine the Angular project main file.');
  }

  return mainFile;
}
