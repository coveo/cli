import {bold} from 'chalk';
import {PlatformClient} from '@coveord/platform-client';
import {
  BuiltInTransformers,
  DocumentBuilder,
  FieldAnalyser,
  Metadata,
  parseAndGetDocumentBuilderFromJSONDocument,
} from '@coveo/push-api-client';
import {CliUx} from '@oclif/core';
import {PathLike} from 'fs';
import dedent from 'ts-dedent';
import {DocumentParseResult} from './interfaces';
import {getAllJsonFilesFromEntries} from '../utils/file';

/**
 * Parses the JSON files to extract fields required for catalog configuration questions
 * It returns the list of all fieldNames across the documents as well as the different object type values.
 *
 * @param {string[]} filesOrDirectories the path to the JSON documents
 */
export async function getDocumentFieldsAndObjectTypeValues(
  client: PlatformClient,
  filesOrDirectories: string[]
): Promise<DocumentParseResult> {
  const files = getAllJsonFilesFromEntries(filesOrDirectories);
  const fieldNameSet: Set<string> = new Set();
  const objectTypeValueSet: Set<string> = new Set();
  const analyser = new FieldAnalyser(client);
  const docBuilders: DocumentBuilder[] = [];
  const callback = async (docBuilder: DocumentBuilder, docPath: PathLike) => {
    addObjectTypeToSet(objectTypeValueSet, docBuilder, docPath);
    addFieldNameToSet(fieldNameSet, docBuilder);
  };

  for (const filePath of files) {
    docBuilders.push(
      ...parseAndGetDocumentBuilderFromJSONDocument(filePath, {
        callback,
        fieldNameTransformer: BuiltInTransformers.toSnakeCase,
      })
    );
  }

  if (objectTypeValueSet.size === 0) {
    CliUx.ux.error(
      dedent`
        No ${bold('objecttype')} metadata detected while parsing documents.
        The ${bold(
          'objecttype'
        )} metadata is crucial, as it will be used to identify the item a s a product in the index. Ensure this metadata is set on all your items.`
    );
  }

  // TODO: For better performances (less memory consumption), the doc builder should be added in the callback. But the callback needs to be an async function, which is not the case at the moment
  await analyser.add(docBuilders);

  return {
    fields: analyser.report().fields,
    objectTypeValues: getValuesFromSet(objectTypeValueSet),
  };
}

function addFieldNameToSet(set: Set<string>, docBuilder: DocumentBuilder) {
  const documentMetadata = Object.keys({...docBuilder.build().metadata});
  for (const metadataKey of documentMetadata) {
    set.add(metadataKey);
  }
  return set;
}

function addObjectTypeToSet(
  set: Set<string>,
  docBuilder: DocumentBuilder,
  docPath: PathLike
) {
  const document = docBuilder.build();
  const {metadata, uri} = document;
  const objectType = getStringifiedObjectTypeValue(metadata);
  if (objectType && Boolean(objectType)) {
    set.add(objectType);
  } else {
    CliUx.ux.warn(
      `Missing or invalid ${bold(
        'objecttype'
      )} metadata on item ${uri} (${docPath})`
    );
  }
}

function getValuesFromSet(objectTypeValues: Set<string>): string[] {
  return Array.from(objectTypeValues.values());
}

function getStringifiedObjectTypeValue(
  metadata: Metadata | undefined
): string | undefined {
  return metadata?.objecttype?.toString();
}
