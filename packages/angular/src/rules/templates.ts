import {normalize} from '@angular-devkit/core';
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
export function createFiles(_options: CoveoSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const path = './'; // Because path is already defined in the templates structure

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ..._options,
      }),
      move(normalize(path)),
      overwriteIfExists(tree),
    ]);

    const rule = mergeWith(templateSource);
    return rule(tree, context);
  };
}
