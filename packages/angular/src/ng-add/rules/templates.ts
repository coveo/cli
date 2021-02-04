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
import {CoveoSchema} from '../../headless-engine/schema';

function overwriteIfExists(host: Tree): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}
export function addHeadlessComponents(
  _options: CoveoSchema,
  _project: ProjectDefinition
): Rule {
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
