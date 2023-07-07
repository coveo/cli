import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {join} from 'node:path';
import {Config} from '@coveo/cli-commons/config/config';
import {
  Preconditions,
  IsAuthenticated,
  HasNecessaryCoveoPrivileges,
  AuthenticationType,
} from '@coveo/cli-commons/preconditions/index';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {spawnProcess} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {
  IsNodeVersionInRange,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions';
import {cwd} from 'node:process';
import {mkdirSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import dedent from 'ts-dedent';

export default class Vue extends CLICommand {
  public static packageName = '@coveo/create-headless-vue';
  public static npmInitName = '@coveo/headless-vue';

  /**
   * @see https://cli.vuejs.org/guide/installation.html for current requirements.
   * @see https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md for upcoming requirements.
   */
  public static requiredNodeVersion = '>=16';
  public static description =
    'Create a Coveo Headless-powered search page with the Vue3 and Vite. See <https://docs.coveo.com/headless> and <https://vuejs.org/>.';

  public static flags = {
    version: Flags.string({
      char: 'v',
      description: `The version of ${Vue.packageName} to use.`,
      default: getPackageVersion(Vue.packageName),
    }),
  };

  public static examples = [
    '$ coveo ui:create:vue myVueProject',
    '$ coveo ui:create:vue-v=1.2.3 myVueProject',
  ];

  public static args = [
    {
      name: 'name',
      description: 'The name of the application to create.',
      required: true,
    },
  ];

  @Trackable({
    eventName: 'ui create',
    overrideEventProperties: {framework: 'vue'},
  })
  @Preconditions(
    IsAuthenticated([AuthenticationType.OAuth]),
    IsNodeVersionInRange(Vue.requiredNodeVersion),
    IsNpxInstalled(),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    const {args, flags} = await this.parse(Vue);

    const dirName = join(cwd(), args.name);
    this.createDirectory(dirName);
    await this.initializeProject(dirName, flags.version);
    await this.installDependencies(dirName);
    await this.createEnvFile(dirName);

    this.displayFeedbackAfterSuccess(args.name);
  }

  private async createEnvFile(dirName: string) {
    const {args} = await this.parse(Vue);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const username = await authenticatedClient.getUsername();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

    writeFileSync(
      join(dirName, '.env'),
      dedent`
        VITE_COVEO_PLATFORM_URL=${platformUrl({environment: cfg.environment})}
        VITE_COVEO_ORGANIZATION_ID=${cfg.organization}
        VITE_COVEO_PLATFORM_ENVIRONMENT=${cfg.environment}
        VITE_COVEO_USER_EMAIL=${username}
        SERVER_COVEO_API_KEY=${apiKey.value!}
      `
    );
  }

  private createDirectory(dirName: string) {
    const stat = statSync(dirName, {throwIfNoEntry: false});
    if (stat === undefined) {
      mkdirSync(dirName);
      return;
    }
    if (!stat.isDirectory()) {
      this.error(
        `${dirName} already exists and is not a directory, use an unused directory name for your project`
      );
    }
    if (readdirSync(dirName, {withFileTypes: true}).length > 0) {
      this.error(
        `${dirName} is a non-empty directory, use an empty directory or unused name for your project`
      );
    }
  }

  private initializeProject(
    dirName: string,
    version: string = getPackageVersion(Vue.packageName)!
  ) {
    return spawnProcess(
      appendCmdIfWindows`npm`,
      ['init', `${Vue.npmInitName}@${version}`],
      {cwd: dirName}
    );
  }

  private installDependencies(dirName: string) {
    return spawnProcess(appendCmdIfWindows`npm`, ['install'], {cwd: dirName});
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private displayFeedbackAfterSuccess(name: string) {
    this.log(
      dedent`
        To get started:

        cd ${name}
        npm run start

        See package.json for other available commands.
        Happy hacking!
    `
    );
  }
}
