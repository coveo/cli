import {bold} from 'chalk';
import {
  CatalogConfigurationModel,
  PlatformClient,
  SourceType,
  CreateSourceModel,
  FieldModel,
} from '@coveord/platform-client';
import {CliUx, Command, Flags} from '@oclif/core';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  selectCatalogStructure,
  selectField,
  selectObjectTypeField,
} from '../../../lib/catalog/questions';
import {Configuration} from '../../../lib/config/config';
import {catalogConfigurationUrl} from '../../../lib/platform/url';
import {withSourceVisibility} from '../../../lib/flags/sourceCommonFlags';
import {getDocumentFieldsAndObjectTypeValues} from '../../../lib/catalog/parse';
import dedent from 'ts-dedent';
import {without} from '../../../lib/utils/list';
import {
  DocumentParseResult,
  PartialCatalogConfigurationModel,
} from '../../../lib/catalog/interfaces';
import {getCatalogPartialConfiguration} from '../../../lib/catalog/detect';
import {newTask, stopCurrentTask} from '../../../lib/utils/spinner';

export default class CatalogCreate extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively along with necessary sources`;

  public static enableJsonFlag = true;

  public static flags = {
    ...withSourceVisibility(),
    interactive: Flags.boolean({
      char: 'i',
      allowNo: true,
      default: false,
      description:
        'Whether to create the catalog configuration interactively. If set to false, the CLI will try to automatically generate a catalog configuration from the data files. If the automatic generation fails, interactive mode will be launched',
    }),
    dataFiles: Flags.string({
      multiple: true,
      char: 'f',
      required: true,
      helpValue: 'products.json availabilities.json',
      // TODO: support folders as well.
      description:
        'Combinaison of JSON files (containing JSON files) to push. Can be repeated.',
    }),
  };

  public static hidden = true;

  public static args = [
    {
      name: 'name',
      description:
        // TODO: check for catalog name uniqueness before doing destructive changes
        "The catalog name must be unique. Editing an existing catalog's name will cause all search interfaces referencing it to cease working.",
      required: true,
    },
  ];

  // Preconditions were removed because they do do not the enableJsonFlag option.
  // Ideally, the preconditions should also support the run method with non-void return
  public async run(): Promise<CatalogConfigurationModel & {sourceId: string}> {
    const {flags} = await this.parse(CatalogCreate);
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const configuration = authenticatedClient.cfg.get();
    newTask('Extracting fields and object types from data');
    const fieldsAndObjectTypes = await getDocumentFieldsAndObjectTypeValues(
      client,
      flags.dataFiles
    );
    const catalogConfigurationModel = await this.generateCatalogConfiguration(
      fieldsAndObjectTypes
    );

    await this.ensureCatalogValidity();

    // Destructive changes starting from here
    const sourceId = await this.createSources(
      client,
      catalogConfigurationModel
    );
    newTask('Creating catalog');
    const catalogConfig = await this.createCatalogConfiguration(
      client,
      catalogConfigurationModel
    );
    await this.createCatalog(client, catalogConfig.id, sourceId);

    newTask('Configuring Catalog fields');
    await this.ensureCatalogFields(
      client,
      catalogConfigurationModel,
      fieldsAndObjectTypes.fields
    );
    stopCurrentTask();

    await this.mapStandardFields(sourceId, catalogConfig.id, configuration);

    return {...catalogConfig, sourceId};
  }

  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  protected async finally(err: Error | undefined) {
    stopCurrentTask(err);
  }

  private async ensureCatalogFields(
    client: PlatformClient,
    catalogConfigurationModel: PartialCatalogConfigurationModel,
    missingFields: FieldModel[]
  ) {
    const fieldsToCreate: FieldModel[] = [];
    const fieldsToUpdate: FieldModel[] = [];
    const parametrizeField = (field: FieldModel) => ({
      ...field,
      multiValueFacet: true,
      multiValueFacetTokenizers: ';',
      useCacheForNestedQuery: true,
    });

    for (const {idField} of Object.values(catalogConfigurationModel)) {
      const missing = missingFields.find((field) => field.name === idField);
      if (missing) {
        fieldsToCreate.push(parametrizeField(missing));
      } else {
        const existing = await client.field.get(idField);
        fieldsToUpdate.push(parametrizeField(existing));
      }
    }

    if (fieldsToCreate.length > 0) {
      await client.field.createFields(fieldsToCreate);
    }
    if (fieldsToUpdate.length > 0) {
      await client.field.updateFields(fieldsToUpdate);
    }
  }

  private async generateCatalogConfiguration(
    fieldsAndObjectTypes: DocumentParseResult
  ): Promise<PartialCatalogConfigurationModel> {
    const {flags} = await this.parse(CatalogCreate);
    if (!flags.interactive) {
      try {
        newTask(
          'Trying to automatically generate catalog configuration from data'
        );
        return getCatalogPartialConfiguration(flags.dataFiles);
      } catch (error) {
        stopCurrentTask(error);
        CliUx.ux.warn(
          dedent`Unable to automatically generate catalog configuration from data.
          Switching to interactive mode.`
        );
      }
    }
    return this.generateCatalogConfigurationInteractively(fieldsAndObjectTypes);
  }

  private async generateCatalogConfigurationInteractively(
    fieldsAndObjectTypes: DocumentParseResult
  ): Promise<PartialCatalogConfigurationModel> {
    let {objectTypeValues} = fieldsAndObjectTypes;
    const fieldnames: string[] = fieldsAndObjectTypes.fields.map(
      (field: FieldModel) => `${field.name}`
    );
    const {variants, availabilities} = await selectCatalogStructure(
      objectTypeValues
    );
    const productObjectType = await selectObjectTypeField(
      'product',
      objectTypeValues
    );
    const productIdField = await selectField(
      `Select your Product ${variants ? 'ID' : 'SKU'} field`,
      fieldnames
    );
    objectTypeValues = without(objectTypeValues, [productObjectType]);
    const model: PartialCatalogConfigurationModel = {
      product: {
        objectType: productObjectType,
        idField: productIdField,
      },
    };

    if (variants) {
      const variantObjectType = await selectObjectTypeField(
        'variant',
        objectTypeValues
      );
      const variantIdField = await selectField(
        'Select your Product SKU field',
        fieldnames
      );
      objectTypeValues = without(objectTypeValues, [variantObjectType]);
      model.variant = {
        objectType: variantObjectType,
        idField: variantIdField,
      };
    }

    if (availabilities) {
      model.availability = {
        objectType: await selectObjectTypeField(
          'availability',
          objectTypeValues
        ),
        idField: await selectField(
          'Select your Availability ID field',
          fieldnames
        ),
        availableSkusField: await selectField(
          'Select your Available SKUs field',
          fieldnames
        ),
      };
    }

    return model;
  }

  private async mapStandardFields(
    sourceId: string,
    catalogConfigurationId: string,
    configuration: Configuration
  ) {
    // TODO: try to automap standard fields with similar name
    const url = catalogConfigurationUrl(
      sourceId,
      catalogConfigurationId,
      configuration
    );
    CliUx.ux.log(`To map standard fields visit ${url}`);
  }

  /**
   * (Optional for phase 0)
   * Parse data a second time to see if the provided inputs from the user can generate a valid catalog
   * This would prevent going forward with a broken/invalid catalog.
   */
  private async ensureCatalogValidity() {
    return;
  }

  private async createCatalogConfiguration(
    client: PlatformClient,
    model: PartialCatalogConfigurationModel
  ): Promise<CatalogConfigurationModel> {
    const {args} = await this.parse(CatalogCreate);
    return client.catalogConfiguration.create({
      ...model,
      name: `${args.name}-configuration`,
      // Field mappings can later be defined in the Admin UI.
      fieldsMapping: {},
    });
  }

  private async createSources(
    client: PlatformClient,
    catalogConfigurationModel: PartialCatalogConfigurationModel
  ) {
    const {args, flags} = await this.parse(CatalogCreate);
    newTask('Creating product source');
    const productSourceId = await this.createCatalogSource(client, {
      name: `${args.name}`,
      sourceVisibility: flags.sourceVisibility,
    });

    if (catalogConfigurationModel.availability) {
      CliUx.ux.warn('Skipping availabilities source creation');
    }

    return productSourceId;
  }

  private async createCatalogSource(
    client: PlatformClient,
    overwriteModel?: CreateSourceModel
  ) {
    const {id} = await client.source.create({
      sourceType: SourceType.CATALOG,
      pushEnabled: true,
      streamEnabled: true,
      ...overwriteModel,
    });
    return id;
  }

  private async createCatalog(
    client: PlatformClient,
    catalogConfigurationId: string,
    sourceId: string,
    availabilitySourceId?: string
  ) {
    const {args} = await this.parse(CatalogCreate);
    return client.catalog.create({
      catalogConfigurationId,
      name: args.name,
      sourceId,
      availabilitySourceId,
      description: 'Created by the Coveo CLI',
    });
  }
}
