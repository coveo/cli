import {bold} from 'chalk';
import {
  CreateCatalogConfigurationModel,
  CatalogConfigurationModel,
  PlatformClient,
  SourceType,
  CreateSourceModel,
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
  CatalogStructure,
  selectCatalogStructure,
  selectIdField,
  selectObjectTypeField,
} from '../../../lib/catalog/questions';
import {Configuration} from '../../../lib/config/config';
import {catalogConfigurationUrl} from '../../../lib/platform/url';
import {withSourceVisibility} from '../../../lib/flags/sourceCommonFlags';
import {getDocumentFieldsAndObjectTypeValues} from '../../../lib/catalog/parse';
import dedent from 'ts-dedent';
import {without} from '../../../lib/utils/list';

type PartialCatalogConfigurationModel = Pick<
  CreateCatalogConfigurationModel,
  'product' | 'variant' | 'availability'
>;

export default class CatalogCreate extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively along with necessary sources`;

  public static flags = {
    ...withSourceVisibility(),
    dataFiles: Flags.string({
      multiple: true,
      char: 'f',
      required: true,
      helpValue: 'products.json availabilities.json',
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
    const catalogConfigurationModel = await this.generateCatalogConfiguration(
      client
    );

    await this.ensureCatalogValidity();

    // Destructive changes starting from here
    const {productSourceId, catalogSourceId} = await this.createSources(
      client,
      catalogConfigurationModel
    );
    const {id: catalogConfigurationId} = await this.createCatalogConfiguration(
      client,
      catalogConfigurationModel
    );
    await this.createCatalog(
      client,
      catalogConfigurationId,
      productSourceId,
      catalogSourceId
    );
    await this.mapStandardFields(
      productSourceId,
      catalogConfigurationId,
      configuration
    );
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async generateCatalogConfiguration(
    client: PlatformClient
  ): Promise<PartialCatalogConfigurationModel> {
    try {
      return await this.generateCatalogConfigurationAutomatically(client);
    } catch (error) {
      CliUx.ux.warn(
        dedent`Unable to automatically generate catalog configuration from data.
        Please answer the following questions`
      );
    }
    return this.generateCatalogConfigurationInteractively(client);
  }

  private async generateCatalogConfigurationAutomatically(
    _client: PlatformClient
  ): Promise<PartialCatalogConfigurationModel> {
    throw 'TODO:';
  }

  private async generateCatalogConfigurationInteractively(
    client: PlatformClient
  ) {
    const {flags} = await this.parse(CatalogCreate);
    let {fields, objectTypeValues} = await getDocumentFieldsAndObjectTypeValues(
      client,
      flags.dataFiles
    );
    const {variants, availabilities} = await selectCatalogStructure(
      objectTypeValues
    );
    const productObjectType = await selectObjectTypeField(
      'product',
      objectTypeValues
    );
    const productIdField = await selectIdField(
      `Select your Product ${variants ? 'ID' : 'SKU'} field`,
      fields
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
      const variantIdField = await selectIdField(
        'Select your Product SKU field',
        fields
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
        idField: await selectIdField(
          'Select your Availability ID field',
          fields
        ),
        availableSkusField: await selectIdField(
          'Select your Available SKUs field',
          fields
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
    let productSourceId = undefined;
    let catalogSourceId = undefined;
    const {args, flags} = await this.parse(CatalogCreate);
    productSourceId = await this.createCatalogSource(client, {
      name: `${args.name}`,
      sourceVisibility: flags.sourceVisibility,
    });

    if (catalogConfigurationModel.availability) {
      catalogSourceId = await this.createCatalogSource(client, {
        name: `${args.name} Availabilities`,
        sourceVisibility: flags.sourceVisibility,
      });
    }

    return {
      productSourceId,
      catalogSourceId,
    };
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
    });
  }
}
