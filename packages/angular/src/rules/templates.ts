import {normalize} from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  FileEntry,
  forEach,
  mergeWith,
  move,
  filter,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {sep} from 'path';
import {CoveoSchema} from '../schema';

function overwriteIfExists(host: Tree): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}

function isNotNodeModuleFile(path: string) {
  return path.split(sep).indexOf('node_modules') === -1;
}

/**
 * Schematic rule that copies files into the Angular project.
 *
 * @export
 * @param {CoveoSchema} _options
 * @param {string} [workspaceRootPath='./']      The root path from which the applyTemplates function will start pasting files.
 *                                               The default value is "./" because the file structure is already defined within the ./files directories
 * @param {string} [templateFilePath='./files']  Path containing the files to copy into the Angular project
 * @returns {Rule}
 */
export function createFiles(
  _options: CoveoSchema,
  workspaceRootPath = './',
  templateFilePath = './files'
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url(templateFilePath), [
      filter(isNotNodeModuleFile),
      applyTemplates({
        ..._options,
      }),
      move(normalize(workspaceRootPath)),
      overwriteIfExists(tree),
    ]);

    const rule = mergeWith(templateSource);
    return rule(tree, context);
  };
}
