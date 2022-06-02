import {CreateCatalogConfigurationModel} from '@coveord/platform-client';

export type PartialCatalogConfigurationModel = Pick<
  CreateCatalogConfigurationModel,
  'product' | 'variant' | 'availability'
>;
