import {validate} from 'jsonschema';
import {SnapshotPullModel} from '../interfaces';
import {InvalidSPMError, UnknownSPMValidationError} from './errors';
import {getSnapshotModel} from './model';

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
