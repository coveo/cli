import {StringValue} from '@coveo/bueno';
import {DocumentBuilder, MetadataValue} from '@coveo/push-api-client';
import {existsSync, lstatSync, PathLike, readFileSync} from 'fs';
import {CaseInsensitiveDocument} from './caseInsensitiveDocument';
import {KnownKeys} from './knownKey';
import {InvalidDocument, NotAFileError} from './validatorErrors';
import {RequiredKeyValidator} from './requiredKeyValidator';

export const parseAndGetDocumentBuilderFromJSONDocument = (
  documentPath: PathLike
) => {
  const isAFile = isFile(documentPath);
  if (!isAFile) {
    throw new NotAFileError(documentPath);
  }

  const fileContent = JSON.parse(readFileSync(documentPath).toString()) as
    | Record<string, string>
    | Record<string, string>[];

  if (Array.isArray(fileContent)) {
    return fileContent.map((doc) => processDocument(doc, documentPath));
  } else {
    return [processDocument(fileContent, documentPath)];
  }
};

const processDocument = (
  fileContent: Record<string, string>,
  documentPath: PathLike
) => {
  const caseInsensitiveDoc = new CaseInsensitiveDocument(fileContent);

  const documentBuilder = validateRequiredKeysAndGetDocumentBuilder(
    caseInsensitiveDoc,
    documentPath
  );
  processKnownKeys(caseInsensitiveDoc, documentBuilder);
  processMetadata(caseInsensitiveDoc, documentBuilder);
  return documentBuilder;
};

const validateRequiredKeysAndGetDocumentBuilder = (
  caseInsensitiveDoc: CaseInsensitiveDocument<string>,
  documentPath: PathLike
) => {
  const requiredDocumentId = new RequiredKeyValidator<string>(
    ['documentid', 'uri'],
    caseInsensitiveDoc,
    new StringValue({required: true, emptyAllowed: false, url: true})
  );

  if (!requiredDocumentId.isValid) {
    throw new InvalidDocument(documentPath, requiredDocumentId.explanation);
  }

  const requiredDocumentTitle = new RequiredKeyValidator<string>(
    'title',
    caseInsensitiveDoc,
    new StringValue({required: true, emptyAllowed: false})
  );
  if (!requiredDocumentTitle.isValid) {
    throw new InvalidDocument(documentPath, requiredDocumentTitle.explanation);
  }

  delete caseInsensitiveDoc.documentRecord['documentid'];
  delete caseInsensitiveDoc.documentRecord['uri'];
  delete caseInsensitiveDoc.documentRecord['title'];

  return new DocumentBuilder(
    requiredDocumentId.value!,
    requiredDocumentTitle.value!
  );
};

const processKnownKeys = (
  caseInsensitiveDoc: CaseInsensitiveDocument<string>,
  documentBuilder: DocumentBuilder
) => {
  new KnownKeys<string>('author', caseInsensitiveDoc).whenExists((author) => {
    documentBuilder.withAuthor(author);
    delete caseInsensitiveDoc.documentRecord['author'];
  });
  new KnownKeys<string>('clickableuri', caseInsensitiveDoc).whenExists(
    (clickuri) => {
      documentBuilder.withClickableUri(clickuri);
      delete caseInsensitiveDoc.documentRecord['clickableuri'];
    }
  );
  new KnownKeys<string>('data', caseInsensitiveDoc).whenExists((data) => {
    documentBuilder.withData(data);
    delete caseInsensitiveDoc.documentRecord['data'];
  });
  new KnownKeys<string>('date', caseInsensitiveDoc).whenExists((date) => {
    documentBuilder.withDate(date);
    delete caseInsensitiveDoc.documentRecord['date'];
  });
  new KnownKeys<string>('modifieddate', caseInsensitiveDoc).whenExists(
    (modifiedDate) => {
      documentBuilder.withModifiedDate(modifiedDate);
      delete caseInsensitiveDoc.documentRecord['modifieddate'];
    }
  );
  new KnownKeys<string>('fileextension', caseInsensitiveDoc).whenExists(
    (fileExtension) => {
      documentBuilder.withFileExtension(fileExtension);
      delete caseInsensitiveDoc.documentRecord['fileextension'];
    }
  );
  new KnownKeys<string>('permanentid', caseInsensitiveDoc).whenExists(
    (permanentId) => {
      documentBuilder.withPermanentId(permanentId);
      delete caseInsensitiveDoc.documentRecord['permanentid'];
    }
  );

  // TODO Support for known key: permissions
};

const processMetadata = (
  caseInsensitiveDoc: CaseInsensitiveDocument<MetadataValue>,
  documentBuilder: DocumentBuilder
) => {
  Object.entries(caseInsensitiveDoc.documentRecord).forEach(([k, v]) => {
    documentBuilder.withMetadataValue(k, v);
  });
};

const isFile = (p: PathLike) => {
  if (!existsSync(p)) {
    return false;
  }
  return lstatSync(p).isFile();
};
