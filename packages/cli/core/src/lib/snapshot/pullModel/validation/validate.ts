import {validate} from 'jsonschema';
import {SnapshotPullModel} from '../interfaces.js';
import {InvalidSPMError, UnknownSPMValidationError} from './errors.js';
import {getSnapshotModel} from './model.js';

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
