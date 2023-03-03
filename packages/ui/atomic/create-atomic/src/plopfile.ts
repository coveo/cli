import {NodePlopAPI} from 'plop';
import {spawn} from 'child_process';
import {getPackageManager} from './utils.js';
import {fetchPageManifest, IManifest} from './fetch-page.js';
import {listSearchPagesOptions} from './list-pages.js';
import {defaultPageManifest} from './default/default-page.js';
import {writeFileSync} from 'node:fs';
import {join} from 'path';
import {createPlatformClient} from './client.js';
import PlatformClient, {RestUserIdType} from '@coveo/platform-client';
import ListPrompt from 'inquirer/lib/prompts/list.js';
import {PromptQuestion} from 'node-plop';

interface PlopData {
  project: string;
  'page-id'?: string;
  'platform-url': string;
  'org-id': string;
  'api-key': string;
  page: IManifest;
  user: string;
}

export default function (plop: NodePlopAPI) {
  const currentPath = process.cwd();
  let platformClientInstance: PlatformClient;

  function initPlatformClient(answers: PlopData) {
    if (platformClientInstance) {
      return platformClientInstance;
    }

    platformClientInstance = createPlatformClient(
      answers['platform-url'],
      answers['org-id'],
      answers['api-key']
    );

    return platformClientInstance;
  }

  async function createSearchToken(
    username: string,
    platformClient: PlatformClient
  ) {
    return await platformClient.search.createToken({
      userIds: [
        {
          name: username,
          provider: 'Email Security Provider',
          type: RestUserIdType.User,
        },
      ],
    });
  }

  plop.setHelper('inc', (value) => parseInt(value) + 1);

  plop.setPrompt('customList', ListPrompt);

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
        // Custom type necessary to allow bypassing async choices
        type: 'customList',
        name: 'page-id',
        default: undefined,
        loop: false,
        pageSize: 10,
        message:
          'Use an existing hosted search page as a template, or start from scratch?',
        choices: async function (answers: PlopData) {
          return [
            {value: undefined, name: 'Start from scratch'},
            {type: 'separator'},
            ...(await listSearchPagesOptions(initPlatformClient(answers))),
          ];
        },
        validate: async (input, answers: PlopData) => {
          try {
            return !!(await fetchPageManifest(
              initPlatformClient(answers),
              input
            ));
          } catch (error) {
            return `The search page with the id "${input}" does not exist.`;
          }
        },
      } as PromptQuestion,
    ],
    actions: function () {
      return [
        async function download(data) {
          const answers = data as PlopData;
          if (answers['page-id']) {
            answers.page = await fetchPageManifest(
              initPlatformClient(answers),
              answers['page-id']
            );
            return `Hosted search page named "${answers.page.config.title}" has been downloaded`;
          }

          answers.page = defaultPageManifest;
          return 'Using the default search page template.';
        },
        async function generateSearchToken(data) {
          const answers = data as PlopData;
          const platformClient = initPlatformClient(answers);
          const apiKeyModel = await createSearchToken(
            answers['user'],
            platformClient
          );
          answers['api-key'] = apiKeyModel.token;
          return 'A search token has been created for this project';
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
            '../template/README.md',
            '../template/coveo.deploy.json',
            '../template/deployment.esbuild.mjs',
          ],
        },
        function generateTemplates(data) {
          const {project, page} = data as PlopData;
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
            const installProcess = spawn(getPackageManager(), ['install'], {
              stdio: ['ignore', 'pipe', 'pipe'],
              cwd: join(currentPath, project),
            });

            let output = '';
            installProcess.stdout.on('data', (chunk) => {
              output += chunk.toString();
            });
            installProcess.stderr.on('data', (chunk) => {
              output += chunk.toString();
            });

            installProcess.on('close', (code, signal) => {
              if (code === 0) {
                resolve('Installation complete');
              } else {
                const codeMsg = `Installation exited with code "${code}"`;
                const signalMsg = signal ? ` & signal:${signal} ` : '';
                reject(`${codeMsg}${signalMsg} ${output}`);
              }
            });
          });
        },
        function getStarted(data) {
          const {project} = data as PlopData;
          return `
          To get started:
          > cd ${project}
          > npm start
  
          To share your site with the world, make sure you are logged in to the Coveo CLI and:
          > npm run deploy
      
          Happy hacking!
          `;
        },
      ];
    },
  });
}
