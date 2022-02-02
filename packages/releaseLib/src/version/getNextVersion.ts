import type {ReleaseType, SemVer} from 'semver';
import semver from 'semver';
const {inc} = semver;

const VERSION: Array<ReleaseType> = ['major', 'minor', 'patch'];

export default function (version: SemVer, bumpInfo: {level: 0 | 1 | 2}) {
  return inc(version.version, VERSION[bumpInfo.level]);
}
