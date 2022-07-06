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
import {ensureDirSync, writeJsonSync} from 'fs-extra';
import SourceCatalogAdd from '../source/catalog/add';
import Push from '../org/resources/push';
import {join} from 'path';
import {Project} from '../../lib/project/project';
import {cwd} from 'process';
import {rmSync} from 'fs';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {FieldModel, FieldTypes} from '@coveord/platform-client';
import {selectFieldModel} from '../../lib/catalog/questions';
import {getDocumentFieldsAndObjectTypeValues} from '../../lib/catalog/parse';
import {listAllFieldsFromOrg} from '../../lib/utils/field';
import {buildError} from '../../hooks/analytics/eventUtils';

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
    // FIXME: Should find a cleaner way to run processes and store variables at the beginning of the recipe so they can be used by multiple steps
    const {flags, args} = await this.parse(CommerceRecipe);
    this.ensureTempFolder();
    const fields = await this.getFields();
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
    const groupingIdField = await this.additionalCommerceFeatures(fields); // Should return a different snapshot template based on the user choices
    this.storeParametrizedSnapshotLocally(
      product.objectType,
      args.name,
      groupingIdField!
    );

    await this.newStep('Organization setup', Push, [
      '--sync',
      '--skipPreview',
      '--projectPath',
      CommerceRecipe.tempFolder,
      '--wait',
      '600',
    ]);
    await this.newStep('Indexation', SourceCatalogAdd, [
      sourceId,
      '--createMissingFields',
      '--fullUpload',
      '--skipFullUploadCheck',
      '--files',
      ...flags.dataFiles,
    ]);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    // TODO: CDX-1008: temporary fix until we actually ensure that oclif prints all errors (not only instanceof Error objects)
    throw buildError(err, 'Recipe step failed');
  }

  public async finally(_?: Error) {
    try {
      this.cleanTempFolder();
      super.finally(_);
    } catch (error) {
      // noop
    }
  }

  private storeParametrizedSnapshotLocally(
    objectType: string,
    catalogId: string,
    groupingId: string
  ) {
    const objectTypeReplacementRegex = new RegExp('{{objecttype}}', 'gm');
    const catalogIdReplacementRegex = new RegExp('{{catalogId}}', 'gm');
    const groupingIdReplacementRegex = new RegExp('{{groupingIdField}}', 'gm');
    const snapshot = JSON.stringify(SnapshotTemplate)
      .replace(objectTypeReplacementRegex, objectType)
      .replace(catalogIdReplacementRegex, catalogId)
      .replace(groupingIdReplacementRegex, groupingId);
    const snapshotPath = join(
      CommerceRecipe.tempFolder,
      Project.resourceFolderName,
      'ALL.json' // The name of the snapshot file does not matter
    );

    writeJsonSync(snapshotPath, JSON.parse(snapshot), {spaces: 2});
  }

  private async getFields(): Promise<FieldModel[]> {
    const {flags} = await this.parse(CommerceRecipe);
    const client = await this.client;
    // FIXME: Find a way to prevent duplication of this part which is already being done in the catalog creation piece
    // This costs another document parse that can be prevented
    const {fields: detectedFieldsInData} =
      await getDocumentFieldsAndObjectTypeValues(client, flags.dataFiles);
    const existingFieldsInOrg: FieldModel[] = await listAllFieldsFromOrg(
      client
    );
    const fieldSet = new Set([...detectedFieldsInData, ...existingFieldsInOrg]);
    return Array.from(fieldSet);
  }

  private async additionalCommerceFeatures(fields: FieldModel[]) {
    this.logHeader('Additional Commerce Features');
    // FIXME: here we would need to make the snapshot paratrizable depending on the user's choices
    const field = await this.setupProductGrouping(fields);
    return field;
  }

  private async setupProductGrouping(
    fields: FieldModel[]
  ): Promise<string | undefined> {
    const enableProductGrouping = await CliUx.ux.confirm(
      'Enable Product Grouping (https://docs.coveo.com/en/l78i2152)? (y/n)'
    );
    if (!enableProductGrouping) {
      return;
    }
    const fieldModel = await selectFieldModel(
      'Select your grouping field',
      fields
    );

    if (fieldModel.type !== FieldTypes.STRING) {
      throw 'TODO: handle case where field is not of string type';
    }

    if (fieldModel.name && fieldModel.facet === false) {
      // TODO: update the field to be facetable. Field can be created or not at this point
    }

    return fieldModel.name;
  }

  private ensureTempFolder() {
    ensureDirSync(join(CommerceRecipe.tempFolder, Project.resourceFolderName));
  }

  private cleanTempFolder() {
    rmSync(CommerceRecipe.tempFolder, {force: true, recursive: true});
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

  private get configuration() {
    const authenticatedClient = new AuthenticatedClient();
    return authenticatedClient.cfg.get();
  }

  private get client() {
    const authenticatedClient = new AuthenticatedClient();
    return authenticatedClient.getClient();
  }
}
