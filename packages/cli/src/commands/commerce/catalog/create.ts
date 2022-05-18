import {bold} from 'chalk';
import type {
  CreateCatalogConfigurationModel,
  CatalogConfigurationModel,
  CatalogFieldsMapping,
  New,
  PlatformClient,
} from '@coveord/platform-client';
import {Command, Flags} from '@oclif/core';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';

export default class CatalogCreate extends Command {
  public static description = `${bold.bgYellow(
    '(alpha)'
  )} Create a commerce catalog interactively`;

  public static flags = {
    // TODO: find an alternative to skip all the prompts without having too many flags.
    withVariants: Flags.boolean({
      char: 'v',
      default: false,
      exclusive: ['catalogConfiguration'],
      helpGroup: 'Catalog structure',
      description: 'Whether your catalog contains product variants',
    }),
    withAvailabilites: Flags.boolean({
      char: 'a',
      default: false,
      exclusive: ['catalogConfiguration'],
      helpGroup: 'Catalog structure',
      description:
        'Whether your catalog contains product location and/or availabilities',
    }),
    dataFiles: Flags.string({
      multiple: true,
      char: 'f',
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
    // TODO: CDX-980: prompt user for number of object type levels, In other words: should the catalog include variants and availabilities?

    // TODO: CDX-977: parse documents to extract metadata keys
    // TODO: CDX-977: throw error if no objecttype is found. throw warning if some documents are missing the objecttype
    // TODO: CDX-977: (optional) throw warning for duplicate SKUs

    // TODO: CDX-978: prompt user what objecttype value should define products (and possibly variants and availabilities).
    // TODO: CDX-978: prompt user what fields should be used as catalog ids. This steps should leverage the metadata keys found in the previous step
    // TODO: CDX-978: prompt user for standard field mappings. Only if the CLI is not able to resolve them in the first place
    // TODO: CDX-978: prompt user for source ids. If the there are no sources in the org, create them
    await this.ensureCatalogValidity();

    // Destructive changes starting from here
    const client = await new AuthenticatedClient().getClient();
    const configuration = await this.createCatalogConfiguration(client);
    await this.createCatalog(client, configuration);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async ensureCatalogValidity() {
    // TODO: (Optional for phase 0) parse documents a second time to see if the provided inputs from the user can generate a valid catalog
    // This would prevent going forward with a broken/invalid catalog.
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
