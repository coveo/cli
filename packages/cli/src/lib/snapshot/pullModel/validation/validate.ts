import {validate} from 'jsonschema';
import pullModelSchema from './model.schema.json';
import {SnapshotPullModel} from '../interfaces';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';
import {ResourceSnapshotType} from '@coveord/platform-client';

// TODO: not sure this is necessary
function getSnapshotModel() {
  // TODO: use a schema version logic
  const resourcePattern =
    pullModelSchema.properties.resourcesToExport.patternProperties['.*'];

  const supportedResources = Object.values(ResourceSnapshotType);
  return {
    ...pullModelSchema,
    ...{
      properties: {
        resourcesToExport: {
          patternProperties: {
            [supportedResources.map((resource) => `^${resource}$`).join('|')]:
              resourcePattern,
          },
        },
      },
    },
  };
}

export function validateSnapshotPullModel(
  templateJson: unknown,
  shouldContactCoveo = false
): templateJson is SnapshotPullModel {
  const validation = validate(templateJson, getSnapshotModel());

  if (validation.valid) {
    return true;
  }

  throw validation.errors.length === 0
    ? new UnknownSPMValidationError(shouldContactCoveo)
    : new InvalidSPMError(shouldContactCoveo, validation.errors);
}
