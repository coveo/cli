import {bold} from 'chalk';
import type {
  FieldModel,
  CreateCatalogConfigurationModel,
  CatalogConfigurationModel,
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
import {Answers} from 'inquirer';
import {
  getCatalogStructure,
  selectIdField,
  selectObjectTypeField,
} from '../../../lib/catalog/questions';
import {Configuration} from '../../../lib/config/config';
import {catalogConfigurationUrl} from '../../../lib/platform/url';

export default class CatalogCreate extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively`;

  public static flags = {
    // TODO: find an alternative to skip all the prompts without having too many flags.
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
      char: 'a',
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
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const configuration = authenticatedClient.cfg.get();
    const model = await this.generateCatalogConfiguration(client);

    await this.ensureCatalogValidity();

    // Destructive changes starting from here
    const {id} = await this.createCatalogConfiguration(client, model);
    const {sourceId} = await this.createCatalog(client, id);
    await this.mapStandardFields(sourceId, id, configuration);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async generateCatalogConfiguration(
    client: PlatformClient
  ): Promise<
    Pick<
      CreateCatalogConfigurationModel,
      'product' | 'variant' | 'availability'
    >
  > {
    try {
      return this.automaticallyGenerateCatalogConfiguration(client);
    } catch (error) {}
    return this.manuallyGenerateCatalogConfiguration(client);
  }

  private async automaticallyGenerateCatalogConfiguration(
    client: PlatformClient
  ): Promise<
    Pick<
      CreateCatalogConfigurationModel,
      'product' | 'variant' | 'availability'
    >
  > {
    throw 'TODO:';
  }

  private async manuallyGenerateCatalogConfiguration(client: PlatformClient) {
    const {fields, objectTypes} = await this.parseDocuments(client);
    return await this.promptQuestions(fields, objectTypes);
  }

  private async mapStandardFields(
    sourceId: string,
    catalogConfigurationId: string,
    configuration: Configuration
  ) {
    const shouldMapStandardFields = await CliUx.ux.confirm(
      'Would you like to map standard fields to your catalog?'
    );
    if (!shouldMapStandardFields) {
      return;
    }
    const url = catalogConfigurationUrl(
      sourceId,
      catalogConfigurationId,
      configuration
    );

    CliUx.ux.log(`To map standard fields visit ${url}`);
  }

  private async parseDocuments(client: PlatformClient) {
    const {flags} = await this.parse(CatalogCreate);
    const analyser = new FieldAnalyser(client);
    const docBuilders: DocumentBuilder[] = [];
    const objectTypeValues: Set<MetadataValue> = new Set();
    const callback = async (docBuilder: DocumentBuilder, docPath: PathLike) => {
      // TODO: clean that mess
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
        )} metadata is crucial, as it will be used to identify the item a s a product in the index. Ensure this metadata is set on all your items.`
      );
    }

    await analyser.add(docBuilders);
    console.log('*********************');
    console.log({
      objectTypes: Array.from(objectTypeValues.values()),
      fields: analyser.report().fields,
    });
    console.log('*********************');

    return {
      objectTypes: Array.from(objectTypeValues.values()),
      fields: analyser.report().fields,
    };
  }

  private async promptQuestions(
    fields: FieldModel[],
    objectTypeValues: string[]
  ) {
    let catalogStructure: Answers;
    switch (objectTypeValues.length) {
      case 0:
        throw 'no object type detected.. Review your data';

      case 1:
        catalogStructure = objectTypeValues[0];

      default:
        catalogStructure = getCatalogStructure(objectTypeValues);
    }
    const {variants, availabilities} = getCatalogObjectTypeLevel();
    const fieldNames: string[] = fields.map((field) => `${field.name}`);
    const model: Pick<
      CreateCatalogConfigurationModel,
      'product' | 'variant' | 'availability'
    > = {
      product: {
        objectType: selectObjectTypeField('product', objectTypeValues),
        idField: selectIdField('product', fieldNames),
      },
      // fieldsMapping: getIdenticalFieldMappings(fieldNames),
    };

    if (variants) {
      model.variant = {
        objectType: selectObjectTypeField('variant', objectTypeValues), // TODO: minus the previous one
        idField: selectIdField('variant', fieldNames),
      };
    }

    if (availabilities) {
      model.availability = {
        objectType: selectObjectTypeField('availability', objectTypeValues), // TODO: minus the previous one
        idField: selectIdField('availability', fieldNames),
        availableSkusField: selectIdField('availability', fieldNames),
      };
    }

    // const shouldMapStandardFields = await CliUx.ux.confirm(
    //   'Would you like to map standard fields to your catalog?'
    // );
    // const unmapped = getUnmappedFieldMappings(fieldNames);
    // const hasUnmappedFieldsMappings = Object.keys(unmapped).length > 0;
    // if (hasUnmappedFieldsMappings && shouldMapStandardFields) {
    //   model.fieldsMapping = {
    //     ...model.fieldsMapping,
    //     ...getStandardFieldMappings(fieldNames),
    //   };
    // }
    return model;

    // Catalog Id field step
    // - Select the value attributed to your Product object type.
    // - Select your Product ID field (if no variant is selected, ask "select your product SKU field")
    // - The product ID is used to link the product to its variant. The field must appear on both types of objects. (if no variant is selected, ask "The SKU is used to identify each sellable unit.")
    // Prompt for product Id field and obejct type

    // if (catalogStructure.variant) {
    // - Select the value attributed to your Variant object type.
    // - Select your Product SKU field
    // - The SKU is used to identify each sellable unit.
    //   // Prompt for variant Id field and obejct type
    // }

    // if (catalogStructure.availabilities) {
    //   // Prompt for availabilities Id field and obejct type
    // }

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

  private async createCatalogConfiguration(
    client: PlatformClient,
    model: Pick<
      CreateCatalogConfigurationModel,
      'product' | 'variant' | 'availability'
    >
  ): Promise<CatalogConfigurationModel> {
    const {args} = await this.parse(CatalogCreate);
    return client.catalogConfiguration.create({
      ...model,
      name: `${args.name}-configuration`,
      // Field mappings can later be defined in the Admin UI.
      fieldsMapping: {},
    });
  }

  private async createCatalog(
    client: PlatformClient,
    catalogConfigurationId: string
  ) {
    const {args} = await this.parse(CatalogCreate);
    return client.catalog.create({
      catalogConfigurationId,
      name: args.name,
    });
  }

  private getHierarchyModel(): Pick<
    CreateCatalogConfigurationModel,
    'product' | 'variant' | 'availability'
  > {
    // read variant and availability flags
    throw 'TODO:';
  }
}
