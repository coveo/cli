import Command, {flags} from '@oclif/command';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join, resolve} from 'path';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../../../lib/decorators/preconditions';
import {cli} from 'cli-ux';
import {Project} from '../../../../../lib/project/project';

import {cwd} from 'process';
import {
  SnapshotPullModel,
  SnapshotPullModelResourceType,
} from '../../../../../lib/snapshot/pullModel/interfaces';
import {validateSnapshotPullModel} from '../../../../../lib/snapshot/pullModel/validation/validate';
import fullTemplate from '../../../../../lib/snapshot/pullModel/templates/full.json';
import emptyTemplate from '../../../../../lib/snapshot/pullModel/templates/empty.json';
import {Trackable} from '../../../../../lib/decorators/preconditions/trackable';
import {
  getSelectResourceTypesPrompt,
  ResourcePromptDefaults,
} from '../../../../../lib/snapshot/resourceTypePrompt';
import {ResourceTypeActions} from '../../../../../lib/snapshot/resourceTypePrompt/interfaces';

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
  private resourcesToSelect: SnapshotPullModelResourceType[] = [];

  @Trackable({eventName: 'org resources pull new model'})
  @Preconditions(IsAuthenticated())
  public async run() {
    this.handleTemplate();
    if (await this.shouldStartInteractive()) {
      await this.startInteractiveSession();
    }
    validateSnapshotPullModel(this.modelToWrite, true);
    this.writeTemplate();
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private async shouldStartInteractive() {
    if (!this.modelToWrite) {
      return true;
    }
    return await cli.confirm(
      '\nTemplate used, do you want to modify your model further? (y/n)'
    );
  }

  private async startInteractiveSession<TResource = unknown>() {
    this.modelToWrite = this.modelToWrite ?? emptyTemplate;
    this.resourcesToSelect = [];
    const resourceTypes = await this.selectResourceTypes();
    this.setResourceTypes(resourceTypes);

    for (const resourceType of resourceTypes) {
      const resources = this.selectResource(
        resourceType
      ) as unknown as TResource[];
      this.setResources(resourceType, resources);
    }
  }

  private setResources(_type: unknown, _resources: unknown[]) {
    // TODO CDX-631: Modify modelToWrite to set the resource associated to the resourcetype.
    throw new Error('Method not implemented.');
  }

  private selectResource(_resourceType: unknown): unknown {
    // TODO CDX-631: Start a custom prompt to fetch the resource associated
    throw new Error('Method not implemented.');
  }

  private setResourceTypes(
    resourceTypes: [SnapshotPullModelResourceType, ResourceTypeActions][]
  ) {
    for (const [resourceType, action] of resourceTypes) {
      switch (action) {
        case ResourceTypeActions.Delete:
          delete this.modelToWrite!.resources[resourceType];
          break;
        case ResourceTypeActions.Add:
          this.modelToWrite!.resources[resourceType] = [];
          this.resourcesToSelect!.push(resourceType);
          break;
        case ResourceTypeActions.Edit:
          this.resourcesToSelect!.push(resourceType);
          break;
        case ResourceTypeActions.Skip:
        default:
          break;
      }
    }
    throw new Error('Method not implemented.');
  }

  private async selectResourceTypes(): Promise<
    [SnapshotPullModelResourceType, ResourceTypeActions][]
  > {
    const promptName =
      'Select the resource types you want to use in your model';
    const resourceTypePromptDefaults: ResourcePromptDefaults = {};
    if (this.modelToWrite?.resources) {
      for (const key of Object.keys(this.modelToWrite?.resources)) {
        resourceTypePromptDefaults[key as SnapshotPullModelResourceType] =
          ResourceTypeActions.Skip;
      }
    }
    const promptAnswers = await getSelectResourceTypesPrompt(
      promptName,
      resourceTypePromptDefaults
    );
    return promptAnswers[promptName];
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
    if (validateSnapshotPullModel(templateJSON)) {
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
}
