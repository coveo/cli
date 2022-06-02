import {MetadataValue} from '@coveo/push-api-client';
import {CreateCatalogConfigurationModel} from '@coveord/platform-client';

export type MapValue = string | number | null;
export type MetadataValueMap = Map<string, MapValue[]>;

export interface CatalogFieldStrutureValue {
  possibleIdFields: string[];
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
