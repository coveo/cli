import {bold} from 'chalk';
import {CliUx, Command} from '@oclif/core';
import {Trackable} from '../../lib/decorators/preconditions/trackable';
import SnapshotTemplate from '../../lib/recipes/commerce/snapshot-template.json';
import CatalogCreate from '../commerce/catalog/create';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../lib/decorators/preconditions';
import {rmdirSync, ensureDirSync, writeJsonSync} from 'fs-extra';
import SourceCatalogAdd from '../source/catalog/add';
import Push from '../org/resources/push';
import Atomic from '../ui/create/atomic';
import {join} from 'path';
import {Project} from '../../lib/project/project';
import {cwd} from 'process';

type CommandRunReturn<T extends typeof Command> = Promise<
  ReturnType<InstanceType<T>['run']>
>;

export default class CommerceRecipe extends Command {
  private static tempFolder = join(cwd(), '.coveo-recipe');
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively along with necessary sources`;

  public static flags = {
    ...CatalogCreate.flags,
  };

  public static args = [...CatalogCreate.args];

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges()
    //   TODO:
  )
  public async run() {
    const {flags, args} = await this.parse(CommerceRecipe);
    this.ensureTempFolder();
    const {sourceId, product} = await this.newStep(
      'Catalog creation',
      CatalogCreate,
      [
        args.name,
        '--json',
        '--sourceVisibility',
        flags.sourceVisibility,
        '--dataFiles',
        ...flags.dataFiles,
      ]
    );
    this.storeParametrizedSnapshotLocally(product?.objectType!); // FIXME: update the return type of the catalogCreate command to make object type non-optional
    await this.newStep('Organization setup', Push, [
      '--sync',
      '--skipPreview',
      '--projectPath',
      CommerceRecipe.tempFolder,
      '--wait',
      '600',
    ]);
    await this.newStep('Indexation', SourceCatalogAdd, [
      sourceId!,
      '--createMissingFields',
      '--fullUpload',
      '--files',
      ...flags.dataFiles,
    ]);
    await this.newStep('Search page generation', Atomic, [args.name]);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    // TODO: CDX-1008: temporary fix until we actually ensure that oclif prints all errors (not only instanceof Error objects)
    if (err && !(err instanceof Error)) {
      const logger = typeof err === 'string' ? CliUx.ux.error : console.error;
      logger('Recipe step failed');
      logger(err);
    }
    throw err;
  }

  public async finally() {
    try {
      this.cleanTempFolder();
    } catch (error) {
      // noop
    }
  }

  private storeParametrizedSnapshotLocally(objectType: string) {
    const objectTypeReplacementRegex = new RegExp('{{objecttype}}', 'gm');
    const snapshot = JSON.stringify(SnapshotTemplate).replace(
      objectTypeReplacementRegex,
      objectType
    );
    const snapshotPath = join(
      CommerceRecipe.tempFolder,
      Project.resourceFolderName,
      'ALL.json' // The name of the snapshot file does not matter
    );

    writeJsonSync(snapshotPath, JSON.parse(snapshot), {spaces: 2});
  }

  private ensureTempFolder() {
    ensureDirSync(join(CommerceRecipe.tempFolder, Project.resourceFolderName));
  }

  private cleanTempFolder() {
    rmdirSync(CommerceRecipe.tempFolder);
  }

  private logHeader(name: string) {
    CliUx.ux.log('');
    CliUx.ux.styledHeader(name);
  }

  private async newStep<T extends typeof Command>(
    name: string,
    command: T,
    argv?: string[]
  ): CommandRunReturn<T> {
    this.logHeader(name);
    return command.run(argv);
  }
}
