const {spawn} = require('child_process');
const {getPackageManager} = require('../cra-template/template/scripts/utils');

module.exports = function (
  /** @type {import('plop').NodePlopAPI} */
  plop
) {
  const currentPath = process.cwd();
  plop.setGenerator('@coveo/atomic', {
    description: 'A Coveo Atomic Generator',
    prompts: [
      {
        type: 'input',
        name: 'project',
        message: 'Name of the project',
        validate: (input) => {
          // Taken from http://json.schemastore.org/package
          const npmPackageRegex =
            '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*';
          if (!new RegExp(npmPackageRegex).test(input)) {
            return `Project name is invalid, please follow the guidelines: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name)`;
          }

          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: currentPath + '/{{project}}/package.json',
        templateFile: 'templates/package.hbs',
      },
      {
        type: 'add',
        path: currentPath + '/{{project}}/public/index.html',
        templateFile: 'templates/public/index.hbs',
      },
      {
        type: 'addMany',
        destination: currentPath + '/{{project}}/',
        base: 'templates',
        templateFiles: [
          'templates/public/style/*',
          'templates/scripts/*',
          'templates/.env.example',
          'templates/.gitignore',
        ],
      },
      function installPackages(answers) {
        const {project} = answers;
        spawn(getPackageManager(), ['install'], {
          stdio: 'inherit',
          cwd: `${currentPath}/${project}/`,
        });
      },
    ],
  });
};
