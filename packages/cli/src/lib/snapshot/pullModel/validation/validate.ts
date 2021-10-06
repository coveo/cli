import {validate} from 'jsonschema';
import pullModelSchema from './model.schema.json';
import {SnapshotPullModel} from '../interfaces';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';

export function validateSnapshotPullModel(
  templateJson: unknown = {},
  shouldContactCoveo = false
): templateJson is SnapshotPullModel {
  const validation = validate(templateJson, pullModelSchema);

  if (validation.valid) {
    return true;
  }

  throw validation.errors.length === 0
    ? new UnknownSPMValidationError(shouldContactCoveo)
    : new InvalidSPMError(shouldContactCoveo, validation.errors);
}
