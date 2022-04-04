import {NodePlopAPI} from 'plop';
import {spawn} from 'child_process';
import {getPackageManager} from './utils.js';
import {fetchPageManifest} from './fetch-page.js';
import {defaultPageManifest} from './default/default-page.js';
import {writeFileSync} from 'node:fs';
import {join} from 'path';
import {IManifestResponse} from '@coveord/platform-client';

interface PlopData {
  project: string;
  'page-id': string;
  'platform-url': string;
  'org-id': string;
  'api-key': string;
  page: IManifestResponse;
}

export default function (plop: NodePlopAPI) {
  const currentPath = process.cwd();

  plop.setHelper('inc', (value) => parseInt(value) + 1);

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
      {
        type: 'input',
        name: 'page-id',
        default: '',
        message:
          '(Optional) The hosted search page ID, e.g. "7944ff4a-9943-4999-a3f6-3e81a7f6fb0a".',
      },
    ],
    actions: function () {
      return [
        function downloadSearchPagePrompt(data) {
          const plopData = data as PlopData;
          if (plopData['page-id'] !== '') {
            return 'Downloading Hosted Search Page';
          }

          return '';
        },
        async function downloadSearchPage(data) {
          const plopData = data as PlopData;
          if (plopData['page-id'] === '') {
            plopData.page = defaultPageManifest;
            return '';
          }

          try {
            plopData.page = await fetchPageManifest(
              // TODO: replace
              'http://localhost:8222', // plopData['platform-url'],
              plopData['org-id'],
              plopData['page-id'],
              plopData['api-key']
            );

            return `Hosted search page "${plopData.page.config.title}" downloaded`;
          } catch (error) {
            throw new Error(
              `There was an error downloading search page with id "${plopData['page-id']}" from the organization "${plopData['org-id']}": ${error}`
            );
          }
        },
        {
          type: 'add',
          path: currentPath + '/{{project}}/.env',
          templateFile: '../template/.env.hbs',
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
            '../template/start-netlify.mjs',
          ],
        },
        function generateTemplates(data) {
          const {page, project} = data as PlopData;
          page.results.templates.forEach((resultTemplate, index) => {
            const filePath = join(
              currentPath,
              project,
              'src',
              'components',
              'results-manager',
              `template-${index + 1}.html`
            );
            writeFileSync(
              filePath,
              plop.renderString('{{{markup}}}', resultTemplate)
            );
          });

          return `${page.results.templates.length} result template(s) generated`;
        },
        function installPackagesPrompt() {
          return 'Installing packages...';
        },
        function installPackages(data) {
          return new Promise((resolve, reject) => {
            const {project} = data as PlopData;
            const process = spawn(getPackageManager(), ['install'], {
              stdio: 'ignore',
              cwd: join(currentPath, project),
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
        function getStarted(data) {
          const {project} = data as PlopData;
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
      ];
    },
  });
}
