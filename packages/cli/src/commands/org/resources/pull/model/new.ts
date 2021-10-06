import Command, {flags} from '@oclif/command';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join, resolve} from 'path';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../../../lib/decorators/preconditions';
import {cli} from 'cli-ux';
import {Project} from '../../../../../lib/project/project';
import {validate as schemaValidate, ValidationError} from 'jsonschema';
import pullModelSchema from '../../../../../lib/snapshot/pullmodel.schema.json';

import {cwd} from 'process';
import dedent from 'ts-dedent';

// TODO CDX-630: Define SPM schema
interface SnapshotPullModel {
  foo?: string;
}
// TODO CDX-630: Extract in JSON files.
const fullTemplate: SnapshotPullModel = {};
const emptyTemplate: SnapshotPullModel = {};

enum PredefinedTemplates {
  Full = 'full',
  Empty = 'empty',
}
export class New extends Command {
  public static hidden = true;
  public static description = 'description of this example command';

  public static flags = {
    template: flags.string({
      char: 't',
      description: 'The template to use while creating the pull model',
      helpValue: 'full|empty|path/to/existing/model.json',
    }),
  };

  public static args = [
    {
      name: 'name',
      description: 'The name or path of the model to create.',
      required: false,
    },
  ];

  private get flags() {
    const {flags} = this.parse(New);
    return flags;
  }

  private get args() {
    const {args} = this.parse(New);
    return args;
  }

  private modelToWrite: SnapshotPullModel | undefined;

  @Preconditions(IsAuthenticated())
  public async run() {
    this.handleTemplate();
    if (await this.shouldStartInteractive()) {
      await this.startInteractiveSession();
    }
    this.validateSnapshotPullModel(this.modelToWrite, true);
    this.writeTemplate();
  }

  private async shouldStartInteractive() {
    if (!this.modelToWrite) {
      return true;
    }
    return await cli.confirm(
      '\nTemplate used, do you want to modify your model further? (y/n)'
    );
  }

  private async startInteractiveSession<
    TResourceTypesWhaterv = unknown,
    TResource = unknown
  >() {
    const resourceTypes: TResourceTypesWhaterv[] =
      (await this.selectResourceTypes()) as unknown as TResourceTypesWhaterv[]; //an array of somesort.
    this.setResourceTypes(resourceTypes);

    for (const resourceType of resourceTypes) {
      const resources = this.selectResource(
        resourceType
      ) as unknown as TResource[];
      this.setResources(resourceType, resources);
    }
  }

  private setResources(type: unknown, resources: unknown[]) {
    // TODO CDX-631: Modify modelToWrite to set the resource associated to the resourcetype.
    throw new Error('Method not implemented.');
  }

  private selectResource(resourceType: unknown): unknown {
    // TODO CDX-631: Start a custom prompt to fetch the resource associated
    throw new Error('Method not implemented.');
  }

  private setResourceTypes(resourceTypes: unknown) {
    // TODO CDX-630: Modify modelToWrite to set the resourceType or something like that
    throw new Error('Method not implemented.');
  }

  private async selectResourceTypes() {
    // TODO CDX-630: Invoke resourceType prompt
  }

  private handleTemplate() {
    switch (this.flags.template) {
      case PredefinedTemplates.Full:
        this.copyTemplate(fullTemplate);
        break;
      case PredefinedTemplates.Empty:
        this.copyTemplate(emptyTemplate);
        break;
      case '':
      case undefined:
      case null:
        break;
      default:
        this.handleCustomTemplate(this.flags.template);
        break;
    }
  }

  private handleCustomTemplate(templateFlags: string) {
    let templateResolvedPath: string | undefined;
    let templateJSON: string;
    try {
      templateResolvedPath = resolve(templateFlags);
      templateJSON = readJSONSync(templateResolvedPath);
    } catch (error) {
      this.error(
        `An error occured while trying to read the template at ${
          templateResolvedPath || templateFlags
        }, check the value of the --template flag.
        )}`
      );
    }
    if (this.validateSnapshotPullModel(templateJSON)) {
      this.copyTemplate(templateJSON);
    }
  }

  private copyTemplate(starterJson: SnapshotPullModel) {
    this.modelToWrite = starterJson;
  }

  private writeTemplate() {
    let outputFilePath = '';
    if (/\/\\/.test(this.args.name)) {
      outputFilePath = resolve(this.args.name);
    } else {
      const project = new Project(cwd());
      outputFilePath = join(project.pathToProject, 'pullModels');
    }
    writeJSONSync(outputFilePath, this.modelToWrite);
  }

  private validateSnapshotPullModel(
    templateJson: unknown = {},
    shouldContactCoveo = false
  ): templateJson is SnapshotPullModel {
    const validation = schemaValidate(templateJson, pullModelSchema);

    // TODO: Modify error handling depending on this value (i.e. if true, pls contact us kthx)
    !!shouldContactCoveo;
    if (validation.valid) {
      return true;
    }

    if (validation.errors.length === 0) {
      this.error(
        "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'."
      );
    } else {
      this.error(dedent`
      The template does not satisify the Snapshot Pull Model Schema, please correct the following issues:
        ${this.getPrettyValidationErrors(validation.errors)}`);
    }
  }

  private getPrettyValidationErrors(errors: ValidationError[]): string {
    const stackToPrettyError = (stack: string) =>
      ` - ${stack.replace(/^instance\./, '')}\n`;
    return errors
      .reduce<string>(
        (errors, error) => (errors += stackToPrettyError(error.stack)),
        '\n'
      )
      .replace(/\n$/, '');
  }
}
