import {bold} from 'chalk';
import {
  BuiltInTransformers,
  Document,
  DocumentBuilder,
  FieldAnalyser,
  Metadata,
  parseAndGetDocumentBuilderFromJSONDocument,
} from '@coveo/push-api-client';
import PlatformClient, {FieldModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {PathLike} from 'fs';
import dedent from 'ts-dedent';

export async function getDocumentFieldsAndObjectTypeValues(
  client: PlatformClient,
  filePaths: PathLike[]
): Promise<{fields: string[]; objectTypeValues: string[]}> {
  const analyser = new FieldAnalyser(client);
  const docBuilders: DocumentBuilder[] = [];
  const objectTypeValuesSet: Set<string> = new Set();
  const callback = async (docBuilder: DocumentBuilder, docPath: PathLike) => {
    const document = docBuilder.build();
    addObjectTypeToSet(objectTypeValuesSet, document, docPath);
  };

  for (const filePath of filePaths) {
    docBuilders.push(
      ...parseAndGetDocumentBuilderFromJSONDocument(filePath, {
        callback,
        fieldNameTransformer: BuiltInTransformers.toSnakeCase,
      })
    );
  }

  if (objectTypeValuesSet.size === 0) {
    CliUx.ux.error(
      dedent`
        No ${bold('objecttype')} metadata detected while parsing documents.
        The ${bold(
          'objecttype'
        )} metadata is crucial, as it will be used to identify the item a s a product in the index. Ensure this metadata is set on all your items.`
    );
  }

  await analyser.add(docBuilders);

  return {
    objectTypeValues: getValuesFromSet(objectTypeValuesSet),
    fields: pluckFieldName(analyser.report().fields),
  };
}

function addObjectTypeToSet(
  set: Set<string>,
  document: Document,
  docPath: PathLike
) {
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

function pluckFieldName(fieldModels: FieldModel[]): string[] {
  const fields: string[] = [];
  for (const {name} of fieldModels) {
    if (name) {
      fields.push(name);
    }
  }
  return fields;
}

function getStringifiedObjectTypeValue(
  metadata: Metadata | undefined
): string | undefined {
  return metadata?.objecttype?.toString();
}
