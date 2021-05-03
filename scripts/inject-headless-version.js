const {readFileSync, writeFileSync} = require('fs');

const packages = ['angular', 'cra-template', 'vue-cli-plugin-typescript'];
const headlessVersion = '0.x';

const main = () => {
  packages.forEach((p) => {
    let packageJSON = JSON.parse(
      readFileSync(`./packages/${p}/package.json`).toString()
    );
    packageJSON = replaceInDevDependencies(packageJSON, headlessVersion);
    packageJSON = replaceInDependencies(packageJSON, headlessVersion);
    writeFileSync(
      `./packages/${p}/package.json`,
      JSON.stringify(packageJSON, null, 4) + '\n'
    );
  });
};

const replaceInDevDependencies = (packageJSON, versionToReplace) => {
  return replace(packageJSON, versionToReplace, 'devDependencies');
};

const replaceInDependencies = (packageJSON, versionToReplace) => {
  return replace(packageJSON, versionToReplace, 'dependencies');
};

const replace = (packageJSON, versionToReplace, section) => {
  if (packageJSON[section] && packageJSON[section]['@coveo/headless']) {
    packageJSON[section]['@coveo/headless'] = versionToReplace;
  }

  return packageJSON;
};

main();
