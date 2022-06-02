import {
  DocumentBuilder,
  Metadata,
  MetadataValue,
  parseAndGetDocumentBuilderFromJSONDocument,
} from '@coveo/push-api-client';
import {PathLike} from 'fs';
import {containsDuplicates} from '../utils/list';
import {setAreEqual} from '../utils/set';
import {PartialCatalogConfigurationModel} from './interfaces';

type MapValue = string | number | null;
type MetadataValueMap = Map<string, MapValue[]>;

interface CatalogFieldStrutureValue {
  possibleIdFields: string[];
  objectType: MetadataValue;
}
interface CatalogFieldStruture {
  product: CatalogFieldStrutureValue;
  variant?: CatalogFieldStrutureValue;
  // TODO: implement availabilities
}

export async function getCatalogPartialConfiguration(
  filePaths: PathLike[]
): Promise<PartialCatalogConfigurationModel> {
  const structure = await getCatalogFieldStructure(filePaths);
  return convertToCatalogModel(structure);
}

async function getCatalogFieldStructure(
  filePaths: PathLike[]
): Promise<CatalogFieldStruture> {
  const maps = await getMaps(filePaths);

  switch (maps.size) {
    case 1:
      const [firstMapValue] = maps.values();
      return get1ChannelCatalogFieldStructure(firstMapValue);
    case 2:
      return get2ChannelsCatalogFieldStructure(maps);
    case 3:
      // TODO: similar to 2 channel catalog structure but need to create a matrix for availabilities and compare with variant matrix
      throw new Error('Not implemented yet');

    default:
      // Human intervention needed as the complexity significantly increases with the number of object distincts types
      throw new Error('Unable to compute catalog configuration');
  }
}

function convertToCatalogModel(
  structure: CatalogFieldStruture
): PartialCatalogConfigurationModel {
  const {product, variant} = structure;
  if (
    !catalogChannelHasSingleMatch(product) ||
    !catalogChannelHasSingleMatch(variant)
    // TODO: should also check availabilities
  ) {
    throw new Error('Multiple field matches');
  } else {
    return {
      product: {
        idField: product.possibleIdFields[0],
        objectType: product.objectType.toString(),
      },
      variant: {
        idField: variant.possibleIdFields[0],
        objectType: variant.objectType.toString(),
      },
    };
  }
}

async function get1ChannelCatalogFieldStructure(
  map: MetadataValueMap
): Promise<CatalogFieldStruture> {
  const possibleIdFields: string[] = findUniqueMetadataKeysInMap(map);
  const [objectType] = map.keys();

  return {
    product: {
      possibleIdFields,
      objectType,
    },
  };
}

async function get2ChannelsCatalogFieldStructure(
  maps: Map<MetadataValue, MetadataValueMap>
) {
  const uniqueMetadataKeys: string[][] = [];
  maps.forEach((map) => {
    uniqueMetadataKeys.push(findUniqueMetadataKeysInMap(map));
  });
  let objectTypes = Array.from(maps.keys());
  let catalogIdFields = findCatalogIdFields(maps.values(), uniqueMetadataKeys);

  if (catalogIdFields.productIdFields.length === 0) {
    // Change the product / variant order and try again
    objectTypes = objectTypes.reverse();
    catalogIdFields = findCatalogIdFields(
      maps.values(),
      uniqueMetadataKeys.reverse()
    );
  }

  return {
    product: {
      possibleIdFields: catalogIdFields.productIdFields,
      objectType: objectTypes[0],
    },
    variant: {
      possibleIdFields: catalogIdFields.variantIdFields,
      objectType: objectTypes[1],
    },
  };
}

function sanitizeMetadataValue(value: MetadataValue): MapValue {
  switch (typeof value) {
    case 'number':
      return value;
    case 'string':
      return value;
    default:
      // If metadata value is not a string or a number, there is "almost" 0 chance it can be used as an id Field.
      // That being said, we replace that field by null so it can take less space in memory
      return null;
  }
}

function addToMap(map: MetadataValueMap, metadata: Metadata) {
  for (const [key, value] of Object.entries(metadata)) {
    let mapValue = map.get(key);
    if (mapValue === undefined) {
      mapValue = [];
    }
    mapValue.push(sanitizeMetadataValue(value));
    map.set(key, mapValue);
  }
}

/**
 * TODO: what are these maps
 *
 * @param {PathLike[]} filePaths
 * @return {*}  {Promise<Map<MetadataValue, MetadataValueMap>>}
 */
async function getMaps(
  filePaths: PathLike[]
): Promise<Map<MetadataValue, MetadataValueMap>> {
  const objectTypeMap: Map<MetadataValue, MetadataValueMap> = new Map();
  const mapBuilderCallback = async (docBuilder: DocumentBuilder) => {
    const {metadata} = docBuilder.build();
    if (metadata?.objecttype === undefined) {
      return;
    }
    let metadataValueMap = objectTypeMap.get(metadata?.objecttype);
    if (metadataValueMap === undefined) {
      metadataValueMap = new Map();
      objectTypeMap.set(metadata?.objecttype, metadataValueMap);
    }
    addToMap(metadataValueMap, metadata);
  };

  for (const filePath of filePaths) {
    parseAndGetDocumentBuilderFromJSONDocument(filePath, {
      callback: mapBuilderCallback,
    });
  }

  return objectTypeMap;
}

/**
 * TODO: explain what are maps and uniqueKeys matrix...as well as what this function does
 *
 * @param {IterableIterator<MetadataValueMap>} maps
 * @param {string[][]} uniqueMetadataKeys
 * @return {*}
 */
function findCatalogIdFields(
  maps: IterableIterator<MetadataValueMap>,
  uniqueMetadataKeys: string[][]
) {
  // TODO: can be optimized
  const [mapA, mapB] = maps;
  const [uniqueObjectTypeAMetadataKeys, uniqueObjectTypeBMetadataKeys] =
    uniqueMetadataKeys;

  const productIdCandidates: string[] = [];
  for (const metdataKey of uniqueObjectTypeAMetadataKeys) {
    const objectTypeASet = new Set(mapA.get(metdataKey));
    const objectTypeBSet = new Set(mapB.get(metdataKey));
    if (setAreEqual(objectTypeASet, objectTypeBSet)) {
      productIdCandidates.push(metdataKey);
    }
  }
  return {
    productIdFields: productIdCandidates,
    variantIdFields: uniqueObjectTypeBMetadataKeys,
  };
}

function findUniqueMetadataKeysInMap(map: MetadataValueMap): string[] {
  const metadataKeyCandidates: string[] = [];
  for (const [key, values] of map.entries()) {
    if (!containsDuplicates(values)) {
      continue;
    }
    metadataKeyCandidates.push(key);
  }

  return metadataKeyCandidates;
}

function catalogChannelHasSingleMatch(
  channel?: CatalogFieldStrutureValue
): channel is CatalogFieldStrutureValue {
  if (!Array.isArray(channel)) {
    return false;
  }
  return channel.possibleIdFields.length === 1;
}
