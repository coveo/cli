export const binariesMatcher =
  /^coveo[_-]{1}(?<version>v?\d+\.\d+\.\d+(-\d+)*?)[_.-]{1}(?<commitSHA>\w+)[_-]?(\d+_)?(?<longExt>.*\.(exe|deb|pkg))$/;
export const manifestMatcher =
  /^coveo-(?<version>v?\d+\.\d+\.\d+(-\d+)*?)-(?<commitSHA>\w+)-(?<targetSignature>.*-buildmanifest)$/;
export const tarballMatcher =
  /^coveo-v?(?<version>\d+\.\d+\.\d+(-\d+)*?)-(?<commitSHA>\w+)-(?<targetSignature>[\w-]+).tar\.[gx]z$/;
