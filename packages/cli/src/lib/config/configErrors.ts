import {coerce, gt, lt} from 'semver';
import dedent from 'ts-dedent';
import {Config} from './config';

export class IncompatibleConfigurationError extends Error {
  public constructor(version: unknown) {
    super();
    switch (typeof version) {
      case 'string':
        this.message = this.computeMessageForString(version);
        break;
      case 'undefined':
        this.message = 'No version found in config';
        break;
      default:
        this.message = `Version found in config is a ${typeof version}. Expected a string.`;
        break;
    }
  }

  private computeMessageForString(version: string) {
    const coercedSemver = coerce(version);
    if (coercedSemver === null) {
      return `Version found in config '${version}' is not parsable to a valid semantic version.`;
    }
    if (gt(coercedSemver, Config.CurrentSchemaVersion)) {
      return `Version found in config '${version}' is greater than the one accepted by this version of the CLI.`;
    }
    if (lt(coercedSemver, Config.CurrentSchemaVersion)) {
      return `Version found in config '${version}' is less than the one accepted by this version of the CLI.`;
    }
    return dedent`
    Unknown config version error:
      - configVersion: ${version}
      - compatibleVersion: ${Config.CurrentSchemaVersion}
    Please report this issue to Coveo.`;
  }
}
