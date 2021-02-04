import {Rule, Tree, SchematicContext, chain} from '@angular-devkit/schematics';
import {CoveoSchema} from './schema';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {addHeadlessComponents, updateNgModule} from './setup-project';

export default function (options: CoveoSchema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions.projectType === ProjectType.Application) {
      return chain([
        addHeadlessComponents(options, project),
        updateNgModule(options, project),
        // addThemeToAppStyles(options),
        // addFontsToIndex(options),
        // addMaterialAppStyles(options),
        // addTypographyClass(options),
      ]);
    }

    return;
  };
}
