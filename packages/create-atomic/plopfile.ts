import {NodePlopAPI} from 'plop';
import {spawn} from 'child_process';
import {getPackageManager} from './utils';

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
    ],
    actions: [
      {
        type: 'addMany',
        destination: currentPath + '/{{project}}/',
        base: 'templates',
        templateFiles: [
          'templates/public/style/*',
          'templates/public/index.html',
          'templates/scripts/*',
          'templates/.env.example',
          'templates/.gitignore',
          'templates/package.json',
        ],
      },
      function installPackages(answers) {
        const {project} = answers as PromptsAnswers;
        spawn(getPackageManager(), ['install'], {
          stdio: 'inherit',
          cwd: `${currentPath}/${project}/`,
        });
        return 'Installing packages 🚀';
      },
    ],
  });
}
