import {NodePlopAPI} from 'plop';
import {spawn} from 'child_process';
import {getPackageManager} from './utils.js';
import {fetchPageDownload, PageDownload} from './fetch-page.js';

interface PromptsAnswers {
  project: string;
  'page-id': string;
  'platform-url': string;
  'org-id': string;
  'api-key': string;
}

export default function (plop: NodePlopAPI) {
  const currentPath = process.cwd();
  let pageDownload: PageDownload;

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
          'The hosted search page ID, e.g. "7944ff4a-9943-4999-a3f6-3e81a7f6fb0a".',
      },
    ],
    actions: [
      function downloadSearchPagePrompt(answers: PromptsAnswers) {
        if (answers['page-id'] !== '') {
          return 'Downloading Hosted Search Page';
        }
      },
      async function downloadSearchPage(answers: PromptsAnswers) {
        if (answers['page-id'] === '') {
          return;
        }

        try {
          console.log(answers['platform-url']);
          pageDownload = await fetchPageDownload(
            'http://localhost:8222',
            // answers['platform-url'],
            answers['org-id'],
            answers['page-id'],
            answers['api-key']
          );

          console.log('pageDownloadContent', pageDownload);

          return 'Hosted Search Page Downloaded';
        } catch (error) {
          throw new Error(
            `There was an error downloading search page with id "${answers['page-id']}" from the organization "${answers['org-id']}"`
          );
        }
      },
      {
        type: 'add',
        path: currentPath + '/{{project}}/.env',
        templateFile: '../templates/.env.hbs',
      },
      {
        type: 'addMany',
        destination: currentPath + '/{{project}}/',
        base: '../templates',
        templateFiles: [
          '../templates/src/**',
          '../templates/scripts/*',
          '../templates/.env.example',
          '../templates/.gitignore',
          '../templates/tsconfig.json',
          '../templates/package.json',
          '../templates/stencil.config.ts',
          '../templates/netlify.toml',
          '../templates/README.md',
        ],
      },
      // TODO: modify content with download
      {type: 'modify', path: '../templates/src/'},
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
