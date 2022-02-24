import {NodePlopAPI} from 'plop';
import {spawn} from 'child_process';
import {getPackageManager} from './utils.js';

interface PromptsAnswers {
  project: string;
}

export default function (plop: NodePlopAPI) {
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
            /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*/;
          if (!npmPackageRegex.test(input)) {
            return 'Project name is invalid, please follow the guidelines: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name)';
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'platform-url',
        message:
          'The Plaform URL to use. See https://docs.coveo.com/en/2976/coveo-solutions/deployment-regions-and-strategies',
        default: 'https://platform.cloud.coveo.com',
      },
      {
        type: 'input',
        name: 'org-id',
        message:
          'The unique identifier of the organization in which to generate a search token. See https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id',
      },
      {
        type: 'input',
        name: 'api-key',
        message:
          'An API key granting the impersonate privilege in your organization. The API key should have the impersonate privilege. See https://docs.coveo.com/en/1718/manage-an-organization/manage-api-keys#add-an-api-key',
      },
      {
        type: 'input',
        name: 'user',
        message:
          'The name of the security identity to impersonate, e.g. "alicesmith@example.com". See https://docs.coveo.com/en/56/#name-string-required.',
      },
    ],
    actions: [
      {
        type: 'add',
        path: currentPath + '/{{project}}/.env',
        templateFile: '../template/.env.hbs',
      },
      {
        type: 'addMany',
        destination: currentPath + '/{{project}}/',
        base: '../template',
        templateFiles: [
          '../template/src/**',
          '../template/scripts/*',
          '../template/.env.example',
          '../template/tsconfig.json',
          '../template/stencil.config.ts',
          '../template/netlify.toml',
          '../template/README.md',
          '../template/ensure-port.js',
        ],
      },
      {
        type: 'add',
        path: currentPath + '/{{project}}/.gitignore',
        templateFile: '../template/.gitignore.hbs',
      },
      {
        type: 'add',
        path: currentPath + '/{{project}}/package.json',
        templateFile: '../template/package.json.hbs',
      },
      function installPackagesPrompt() {
        return 'Installing packages...';
      },
      function installPackages(answers) {
        return new Promise((resolve, reject) => {
          const {project} = answers as PromptsAnswers;
          const process = spawn(getPackageManager(), ['install'], {
            stdio: 'ignore',
            cwd: `${currentPath}/${project}/`,
          });

          process.on('close', (code) => {
            if (code === 0) {
              resolve('Installation complete');
            } else {
              reject(`Installation exited with ${code}`);
            }
          });
        });
      },
      function getStarted(answers) {
        const {project} = answers as PromptsAnswers;
        return `
        To get started:
        > cd ${project}
        > npm run site:init (optional, sets up a new Netlify site)
        > npm start

        To share your site with the world:
        > npm run site:deploy
    
        Happy hacking!
        `;
      },
    ],
  });
}
