import {
  ArrayValue,
  BooleanValue,
  PrimitivesValues,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {
  DocumentBuilder,
  Document,
  SecurityIdentity,
  AnySecurityIdentityBuilder,
  MetadataValue,
} from '@coveo/push-api-client';
import {existsSync, lstatSync, PathLike, readFileSync} from 'fs';
import {CaseInsensitiveDocument} from './caseInsensitiveDocument';
import {KnownKeys} from './knownKey';
import {
  InvalidDocument,
  NotAFileError,
  NotAJsonFileError,
} from './validatorErrors';
import {RequiredKeyValidator} from './requiredKeyValidator';
import {readJSONSync} from 'fs-extra';

export const parseAndGetDocumentBuilderFromJSONDocument = (
  documentPath: PathLike
) => {
  ensureFileIntegrity(documentPath);

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
  fileContent: Record<string, PrimitivesValues>,
  documentPath: PathLike
) => {
  const caseInsensitiveDoc = new CaseInsensitiveDocument(fileContent);

  const documentBuilder = validateRequiredKeysAndGetDocumentBuilder(
    caseInsensitiveDoc,
    documentPath
  );
  processKnownKeys(caseInsensitiveDoc, documentBuilder);
  processSecurityIdentities(caseInsensitiveDoc, documentBuilder, documentPath);
  processMetadata(caseInsensitiveDoc, documentBuilder);
  return documentBuilder;
};

const validateRequiredKeysAndGetDocumentBuilder = (
  caseInsensitiveDoc: CaseInsensitiveDocument<PrimitivesValues>,
  documentPath: PathLike
) => {
  const requiredDocumentId = new RequiredKeyValidator<string>(
    ['documentid', 'uri'],
    caseInsensitiveDoc,
    new StringValue({required: true, emptyAllowed: false})
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
  caseInsensitiveDoc: CaseInsensitiveDocument<PrimitivesValues>,
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
};

const processSecurityIdentities = (
  caseInsensitiveDoc: CaseInsensitiveDocument<PrimitivesValues>,
  documentBuilder: DocumentBuilder,
  documentPath: PathLike
) => {
  new KnownKeys<Document['permissions']>(
    'permissions',
    caseInsensitiveDoc
  ).whenExists((permissions) => {
    const caseInsensitivePermissions = new CaseInsensitiveDocument(
      permissions!
    );
    const requiredAllowAnonymous = new RequiredKeyValidator(
      'allowanonymous',
      caseInsensitivePermissions,
      new BooleanValue({required: true})
    );
    if (!requiredAllowAnonymous.isValid) {
      throw new InvalidDocument(
        documentPath,
        requiredAllowAnonymous.explanation
      );
    }

    const requiredAllowedPermissions = new RequiredKeyValidator(
      'allowedpermissions',
      caseInsensitivePermissions,
      getSecurityIdentitySchemaValidation()
    );

    if (!requiredAllowedPermissions.isValid) {
      throw new InvalidDocument(
        documentPath,
        requiredAllowedPermissions.explanation
      );
    }

    const requiredDeniedPermissions = new RequiredKeyValidator(
      'deniedpermissions',
      caseInsensitivePermissions,
      getSecurityIdentitySchemaValidation()
    );

    if (!requiredDeniedPermissions.isValid) {
      throw new InvalidDocument(
        documentPath,
        requiredDeniedPermissions.explanation
      );
    }

    documentBuilder.withAllowAnonymousUsers(permissions!.allowAnonymous);
    permissions?.allowedPermissions?.forEach((p) => {
      documentBuilder.withAllowedPermissions(
        new AnySecurityIdentityBuilder(
          p.identityType,
          p.identity,
          p.securityProvider
        )
      );
    });
    permissions?.deniedPermissions?.forEach((p) => {
      documentBuilder.withDeniedPermissions(
        new AnySecurityIdentityBuilder(
          p.identityType,
          p.identity,
          p.securityProvider
        )
      );
    });

    delete caseInsensitiveDoc.documentRecord['permissions'];
  });
};

const processMetadata = (
  caseInsensitiveDoc: CaseInsensitiveDocument<PrimitivesValues>,
  documentBuilder: DocumentBuilder
) => {
  Object.entries(caseInsensitiveDoc.documentRecord).forEach(([k, v]) => {
    documentBuilder.withMetadataValue(
      k,
      v! as Extract<PrimitivesValues, MetadataValue>
    );
  });
};

const ensureFileIntegrity = (documentPath: PathLike) => {
  if (!isFile(documentPath)) {
    throw new NotAFileError(documentPath);
  }
  if (!isValidJsonFile(documentPath)) {
    throw new NotAJsonFileError(documentPath);
  }
};

const isFile = (p: PathLike) => {
  if (!existsSync(p)) {
    return false;
  }
  return lstatSync(p).isFile();
};

const isValidJsonFile = (p: PathLike) => {
  try {
    readJSONSync(p.toString());
  } catch (e) {
    return false;
  }
  return true;
};

const getSecurityIdentitySchemaValidation =
  (): ArrayValue<SecurityIdentity> => {
    return new ArrayValue({
      required: true,
      each: new RecordValue({
        values: {
          identity: new StringValue({required: true, emptyAllowed: false}),
          identityType: new StringValue({
            constrainTo: ['UNKNOWN', 'USER', 'GROUP', 'VIRTUAL_GROUP'],
            required: true,
            emptyAllowed: false,
          }),
          securityProvider: new StringValue({
            emptyAllowed: false,
            required: true,
          }),
        },
      }),
    });
  };
