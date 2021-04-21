const fs = require('fs');
const path = require('path');

const binariesMatcher = /^coveo(_|-)(?<_version>v?\d+\.\d+\.\d+(-\d+)?)(?<longExt>.*\.(exe|deb|pkg))$/;
const distDir = 'dist';
const getOsSlug = () => {
  switch (process.platform) {
    case 'win32':
      return 'win';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'deb';
  }
};
const getBinaryFolder = () => path.resolve(distDir, getOsSlug());

const files = fs.readdirSync(getBinaryFolder(), {withFileTypes: true});
files.forEach((file) => {
  const match = binariesMatcher.exec(file.name);
  if (!match) {
    return;
  }
  const destName = `coveo-latest${match.groups.longExt}`;
  fs.copyFileSync(
    path.resolve(getBinaryFolder(), file.name),
    path.resolve(distDir, destName)
  );
});
