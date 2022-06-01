import {bold} from 'chalk';
import type {
  FieldModel,
  CreateCatalogConfigurationModel,
  CatalogConfigurationModel,
  CatalogFieldsMapping,
  New,
  PlatformClient,
} from '@coveord/platform-client';
import {CliUx, Command, Flags} from '@oclif/core';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  BuiltInTransformers,
  DocumentBuilder,
  FieldAnalyser,
  MetadataValue,
  parseAndGetDocumentBuilderFromJSONDocument,
} from '@coveo/push-api-client';
import {PathLike} from 'fs';
import dedent from 'ts-dedent';

export default class CatalogCreate extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively`;

  public static flags = {
    dataFiles: Flags.string({
      multiple: true,
      char: 'f',
      required: true,
      helpValue: 'products.json',
      description:
        'Combinaison of JSON files and folders (containing JSON files) to push. Can be repeated.',
    }),
    availabilityFiles: Flags.string({
      multiple: true,
      char: 'A',
      dependsOn: ['withavailabilites'],
      helpValue: 'availabilities.json',
      description:
        'Combinaison of JSON files and folders (containing JSON files) to push. Can be repeated.',
    }),
  };

  public static hidden = true;

  public static args = [
    {
      name: 'name',
      description:
        "The catalog name must be unique. Editing an existing catalog's name will cause all search interfaces referencing it to cease working.",
      required: true,
    },
  ];

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges()
    // TODO: Add edit catalog privilege. https://docs.coveo.com/en/2956/coveo-for-commerce/index-commerce-catalog-content-with-the-stream-api#required-privileges
  )
  public async run() {
    this.printWarningMessage();
    const client = await new AuthenticatedClient().getClient();
    const {fields, objectTypes} = await this.parseDocuments(client);

    await this.promptQuestions(fields, objectTypes);
    await this.ensureCatalogValidity();

    // Destructive changes starting from here
    const configuration = await this.createCatalogConfiguration(client);
    await this.createCatalog(client, configuration);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async parseDocuments(client: PlatformClient) {
    const {flags} = await this.parse(CatalogCreate);
    const analyser = new FieldAnalyser(client);
    const docBuilders: DocumentBuilder[] = [];
    const objectTypeValues: Set<MetadataValue> = new Set();
    const callback = async (docBuilder: DocumentBuilder, docPath: PathLike) => {
      const {metadata, uri} = docBuilder.build();
      if (metadata?.objecttype === undefined) {
        CliUx.ux.warn(
          `missing ${bold('objecttype')} metadata on item ${uri} (${docPath})`
        );
      } else {
        objectTypeValues.add(metadata.objecttype);
      }
    };

    for (const filePath of flags.dataFiles.values()) {
      docBuilders.push(
        ...parseAndGetDocumentBuilderFromJSONDocument(filePath, {
          callback,
          fieldNameTransformer: BuiltInTransformers.toLowerCase,
        })
      );
    }

    if (objectTypeValues.size === 0) {
      CliUx.ux.error(
        dedent`
        No ${bold('objecttype')} metadata detected while parsing documents.
        The ${bold(
          'objecttype'
        )} metadata is crucial, as it will be used to identify the item as a product in the index. Ensure this metadata is set on all your items.
        See https://docs.coveo.com/en/m53g7119 for more information.`
      );
    }

    await analyser.add(docBuilders);
    return {
      objectTypes: Array.from(objectTypeValues.values()),
      fields: analyser.report().fields,
    };
  }

  private async promptQuestions(
    _fields: FieldModel[],
    _objectTypes: MetadataValue[]
  ) {
    // TODO: CDX-978: prompt user what objecttype value should define products (and possibly variants and availabilities).
    // TODO: CDX-978: prompt user what fields should be used as catalog ids. This steps should leverage the metadata keys found in the previous step
    // TODO: CDX-978: prompt user for standard field mappings. Only if the CLI is not able to resolve them in the first place
    // TODO: CDX-978: prompt user for source ids. If the there are no sources in the org, create them
  }

  /**
   * (Optional for phase 0)
   * Parse data a second time to see if the provided inputs from the user can generate a valid catalog
   * This would prevent going forward with a broken/invalid catalog.
   */
  private async ensureCatalogValidity() {
    // TODO: Throw warning whenever duplicate SKUs are detected
    return;
  }

  private async createCatalogConfiguration(client: PlatformClient) {
    const model = await this.getCatalogConfigurationModel();
    return client.catalogConfiguration.create(model);
  }

  private async getCatalogConfigurationModel(): Promise<
    New<CreateCatalogConfigurationModel>
  > {
    const {args} = await this.parse(CatalogCreate);
    const model: New<CreateCatalogConfigurationModel> = {
      fieldsMapping: this.getFieldMappings(),
      name: `${args.name}-configuration`,
      ...this.getHierarchyModel(),
    };
    return model;
  }

  private async createCatalog(
    client: PlatformClient,
    catalogConfiguration: CatalogConfigurationModel
  ) {
    const {args} = await this.parse(CatalogCreate);
    return client.catalog.create({
      catalogConfigurationId: catalogConfiguration.id,
      name: args.name,
    });
  }

  private printWarningMessage() {
    CliUx.ux.warn(
      'The `commerce:catalog:create` command is currently in alpha, use at your own risk'
    );
  }

  private getFieldMappings(): CatalogFieldsMapping {
    throw 'TODO:';
  }

  private getHierarchyModel(): Pick<
    CreateCatalogConfigurationModel,
    'product' | 'variant' | 'availability'
  > {
    // read variant and availability flags
    throw 'TODO:';
  }
}
