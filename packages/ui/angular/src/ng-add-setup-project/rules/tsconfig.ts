import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {normalize} from '@angular-devkit/core';
import {CoveoSchema} from '../../schema';

const commentRegExp = /\/\*.*\*\//;

export function updateTsConfig(_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsconfigBuffer = tree.read(normalize('./tsconfig.json'));
    if (tsconfigBuffer === null) {
      return;
    }
    try {
      const originalTsConfig = tsconfigBuffer.toString();
      const tsConfigComment =
        originalTsConfig.match(commentRegExp)?.[0]?.trim() ?? '';
      const tsConfig = JSON.parse(
        originalTsConfig.replace(commentRegExp, '').trim()
      );

      tsConfig.compilerOptions.skipLibCheck = true;
      tree.overwrite(
        normalize('./tsconfig.json'),
        `${tsConfigComment}
${JSON.stringify(tsConfig, null, 4)}`
      );
    } catch (error) {
      console.error(
        `Unable to update the Angular tsconfig.json file by adding the "allowSyntheticDefaultImports" flag.
Make sure to add this flag to your tsconfig.json. Otherwise, you might experience errors when running the app`,
        error
      );
    }
  };
}
