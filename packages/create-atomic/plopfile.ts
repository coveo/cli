import {NodePlopAPI} from 'plop';

export default function (plop: NodePlopAPI) {
  const currentPath = process.cwd();
  plop.setGenerator('@coveo/atomic', {
    description: 'A Coveo Atomic Generator',
    prompts: [
      {
        type: 'input',
        name: 'project',
        message: 'Name of the project',
        // TODO validate NPM pattern "^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$"
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
        path: currentPath + '/{{project}}/package-lock.json',
        templateFile: 'templates/package-lock.hbs',
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
          'templates/public/style/layout.css',
          'templates/public/style/theme.css',
        ],
      },
    ],
  });
}
