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
          const pattern =
            '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*';
          if (!new RegExp(pattern).test(input)) {
            return `The project name should match the pattern "${pattern}" (https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name)`;
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
    ],
  });
};
