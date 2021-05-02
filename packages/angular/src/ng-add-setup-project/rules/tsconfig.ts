import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {normalize} from '@angular-devkit/core';
import {CoveoSchema} from '../../schema';
import {EOL} from 'os';

export function updateTsConfig(_options: CoveoSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsconfigBuffer = tree.read(normalize('./tsconfig.json'));
    if (tsconfigBuffer === null) {
      return;
    }
    try {
      const fileArray = tsconfigBuffer.toString().split(EOL);
      const tsconfigcomment = fileArray[0];
      const tsConfig = JSON.parse(fileArray.slice(1).join(EOL));

      tsConfig.compilerOptions.allowSyntheticDefaultImports = true;

      tree.overwrite(
        normalize('./tsconfig.json'),
        `${tsconfigcomment}
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
