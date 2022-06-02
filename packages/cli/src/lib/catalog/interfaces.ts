import {MetadataValue} from '@coveo/push-api-client';
import {CreateCatalogConfigurationModel} from '@coveord/platform-client';

export type MetadataKey = string;
export type MapValue = string | number | null;

/**
 * A map which stores the medata key as well as all the possible values for that metada
 */
export type MetadataValueMap = Map<MetadataKey, MapValue[]>;

export interface CatalogFieldStrutureValue {
  possibleIdFields: MetadataKey[];
  objectType: MetadataValue;
}

export interface CatalogFieldStruture {
  product: CatalogFieldStrutureValue;
  variant?: CatalogFieldStrutureValue;
  availability?: CatalogFieldStrutureValue & {
    availableSkusField: MetadataValue;
  };
}

export type PartialCatalogConfigurationModel = Pick<
  CreateCatalogConfigurationModel,
  'product' | 'variant' | 'availability'
>;
