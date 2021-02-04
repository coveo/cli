import {dirname, join, basename} from 'path';
import {normalize} from '@angular-devkit/core';
import {ProjectDefinition} from '@angular-devkit/core/src/workspace';
import {
  apply,
  applyTemplates,
  FileEntry,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {
  addDeclarationToModule,
  getAppModulePath,
  getProjectMainFile,
} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {createSourceFile, ScriptTarget} from 'typescript';
import {getDefaultAppModuleContent} from '../utils/module-utils';
import {CoveoSchema} from './schema';
import {classify} from '@angular-devkit/core/src/utils/strings';

export function overwriteIfExists(host: Tree): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

export function installDepedencies(_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log('>>>>> Installing dependencies');
    const headlessDependency: NodeDependency = {
      type: NodeDependencyType.Default,
      name: '@coveo/headless',
      version: '^0', // TODO: find a better way to get latest version
      overwrite: true,
    };

    addPackageJsonDependency(tree, headlessDependency);

    // // Adding the rest of Coveo components to the app
    // _context.addTask(new RunSchematicTask('ng-add-setup-project', options), []);

    // Installing Coveo headless package
    _context.addTask(new NodePackageInstallTask(), []);
  };
}

export function addHeadlessComponents(
  options: CoveoSchema,
  _project: ProjectDefinition
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const path = './'; // Because path is already defined in the templates structure

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ...options,
      }),
      move(normalize(path)),
      overwriteIfExists(tree),
      //   findAllNewComponents(tree, project),
    ]);

    const rule = mergeWith(templateSource);
    return rule(tree, context);
  };
}

export function updateNgModule(
  _options: CoveoSchema,
  project: ProjectDefinition
): Rule {
  //   return async () => {
  return (tree: Tree, _context: SchematicContext) => {
    const appModulePath = getAppModulePath(tree, getProjectMainFile(project));

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
    const changes: InsertChange[] = [];

    // TODO: not sure this is the right way to get all new component
    tree.actions
      .filter((action) => {
        // Filter out non TS files
        const splitted = action.path.split('.');
        return splitted.indexOf('ts') !== -1 && splitted.indexOf('spec') === -1;
      })
      .map((action) => {
        if (action.kind === 'c') {
          // Only new components to add to the project
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

    for (const change of changes) {
      if (change instanceof InsertChange) {
        updateRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    tree.commitUpdate(updateRecorder);

    return tree;
  };
}
