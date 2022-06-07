import {
  DocumentBuilder,
  Metadata,
  MetadataValue,
  parseAndGetDocumentBuilderFromJSONDocument,
} from '@coveo/push-api-client';
import {PathLike} from 'fs';
import {containsDuplicates} from '../utils/list';
import {setAreEqual} from '../utils/set';
import {
  CatalogFieldStruture,
  CatalogFieldStrutureValue,
  MapValue,
  MetadataValueMap,
  PartialCatalogConfigurationModel,
} from './interfaces';

export function getCatalogPartialConfiguration(
  filePaths: PathLike[]
): PartialCatalogConfigurationModel {
  const structure = getCatalogFieldStructure(filePaths);
  return convertToCatalogModel(structure);
}

function getCatalogFieldStructure(filePaths: PathLike[]): CatalogFieldStruture {
  const maps = getMaps(filePaths);

  switch (maps.size) {
    case 1:
      const [firstMapValue] = maps.values();
      return get1ChannelCatalogFieldStructure(firstMapValue);
    case 2:
      // TODO: support products x availabilities configuration
      return get2ChannelsCatalogFieldStructure(maps);
    case 3:
      // TODO: support products x variants x availabilities configuration
      throw new Error('Not implemented yet');

    default:
      // Human intervention needed as the complexity significantly increases with the number of object distincts types.
      // If we reach this condition, it probably means the documents have not been given the correct object type
      throw new Error('Unable to compute catalog configuration');
  }
}

function convertToCatalogModel(
  structure: CatalogFieldStruture
): PartialCatalogConfigurationModel {
  const {product, variant, availability} = structure;
  if (
    !catalogChannelHasSingleMatch(product) ||
    (variant && !catalogChannelHasSingleMatch(variant)) ||
    (availability && !catalogChannelHasSingleMatch(availability))
  ) {
    throw new Error('Multiple field matches');
  } else {
    return {
      product: {
        idField: product.possibleIdFields[0],
        objectType: product.objectType.toString(),
      },
      ...(variant && {
        variant: {
          idField: variant.possibleIdFields[0],
          objectType: variant.objectType.toString(),
        },
      }),
      ...(availability && {
        availability: {
          idField: availability.possibleIdFields[0],
          objectType: availability.objectType.toString(),
          availableSkusField: availability.availableSkusField.toString(),
        },
      }),
    };
  }
}

/**
 * Returns the configuration for a single channel catalog
 * The catalog contains products only
 */
function get1ChannelCatalogFieldStructure(
  map: MetadataValueMap
): CatalogFieldStruture {
  const possibleIdFields: string[] = findUniqueMetadataKeysInMap(map);
  const [objectType] = map.keys();

  return {
    product: {
      possibleIdFields,
      objectType,
    },
  };
}

/**
 * Returns the configuration for a dual channel catalog.
 * The catalog can have the following configurations:
 *
 * - Products x Variants
 * - Products x Availabilities // TODO: this is not supported yet
 */
function get2ChannelsCatalogFieldStructure(
  maps: Map<MetadataValue, MetadataValueMap>
) {
  let {parent, child} = getParentChildIdFields(maps);
  // FIXME: child can either be the variant or the availabilities

  return {
    product: {
      possibleIdFields: parent.idFields,
      objectType: parent.objectType,
    },
    variant: {
      possibleIdFields: child.idFields,
      objectType: child.objectType,
    },
  };
}

/**
 * Generates a {@link MetadataValueMap} for each distinct objectype value found in the JSON files.
 * Each {@link MetadataValueMap} is then added to another map where the key / value association respects the following rule:
 * Object key value / MetadataValueMap
 *
 * @param {PathLike[]} filePaths
 * @return {*} A 2 levels deep map
 */
function getMaps(filePaths: PathLike[]): Map<MetadataValue, MetadataValueMap> {
  const objectTypeMap: Map<MetadataValue, MetadataValueMap> = new Map();
  const mapBuilderCallback = (docBuilder: DocumentBuilder) => {
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
 * Determine the relation between the 2 maps passed in parameter.
 * The parent map will represent the product set and the child, variant (or availabilities).
 *
 * This is where we figure out which metadata key is used as a bridge between the parent and child∂.
 *
 * @param {Map<MetadataValue, MetadataValueMap>} maps Map of maps. Essentially, the parent and child maps.
 * @return {*}
 */
function getParentChildIdFields(maps: Map<MetadataValue, MetadataValueMap>) {
  let objectTypes = Array.from(maps.keys());
  const [mapA, mapB] = Array.from(maps.values());
  const [parentIdCandidates, childIdCandidates]: string[][] = [[], []];
  const uniqueMetadataKeyMatrix: string[][] = [];
  maps.forEach((map) => {
    uniqueMetadataKeyMatrix.push(findUniqueMetadataKeysInMap(map));
  });

  for (const uniqueMetadataKeys of uniqueMetadataKeyMatrix) {
    for (const metdataKey of uniqueMetadataKeys) {
      const objectTypeASet = new Set(mapA.get(metdataKey));
      const objectTypeBSet = new Set(mapB.get(metdataKey));
      if (setAreEqual(objectTypeASet, objectTypeBSet)) {
        parentIdCandidates.push(metdataKey);
      }
    }
    if (parentIdCandidates.length > 0) {
      // Stop since we found our parent.
      // Otherwise, continue to loop since the second element from the array is the parent
      const childIndex =
        1 - uniqueMetadataKeyMatrix.indexOf(uniqueMetadataKeys);
      childIdCandidates.push(...uniqueMetadataKeyMatrix[childIndex]);
      objectTypes = objectTypes.reverse();
      break;
    }
  }

  return {
    parent: {
      idFields: parentIdCandidates,
      objectType: objectTypes[0],
    },
    child: {
      idFields: childIdCandidates,
      objectType: objectTypes[1],
    },
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
  channel: CatalogFieldStrutureValue
): channel is CatalogFieldStrutureValue {
  if (!Array.isArray(channel.possibleIdFields)) {
    return false;
  }
  return channel.possibleIdFields.length === 1;
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