import {Command, Flags} from '@oclif/core';
import {
  Preconditions,
  IsAuthenticated,
  HasNecessaryCoveoPrivileges,
  IsNpxInstalled,
  IsNodeVersionInRange,
} from '../../../lib/decorators/preconditions/';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
  viewSearchPagesPrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {spawnProcess} from '../../../lib/utils/process';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {Config} from '../../../lib/config/config';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {platformUrl} from '../../../lib/platform/environment';
import {getPackageVersion} from '../../../lib/utils/misc';

export default class Atomic extends Command {
  public static cliPackage = '@coveo/create-atomic';
  public static requiredNodeVersion = '>=14.0.0 <17.0.0'; // https://github.com/netlify/cli/issues/3617
  public static description =
    "Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and <https://docs.coveo.com/headless>.";
  public static examples = ['$ coveo ui:create:atomic myapp'];
  public static args = [
    {
      name: 'name',
      description: 'The name of the application to create.',
      required: true,
    },
  ];
  public static flags = {
    version: Flags.string({
      char: 'v',
      description: `The version of ${Atomic.cliPackage} to use.`,
      default: getPackageVersion(Atomic.cliPackage) || 'latest',
    }),
    pageId: Flags.string({
      char: 'p',
      description: 'The hosted search page ID.',
      helpValue: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      required: false,
    }),
  };

  @Trackable({
    eventName: 'ui create',
    overrideEventProperties: {framework: 'atomic'},
  })
  @Preconditions(
    IsAuthenticated(),
    IsNpxInstalled(),
    IsNodeVersionInRange(Atomic.requiredNodeVersion),
    HasNecessaryCoveoPrivileges(
      createApiKeyPrivilege,
      impersonatePrivilege,
      viewSearchPagesPrivilege
    )
  )
  public async run() {
    await this.createProject();
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async createProject() {
    const {flags, args} = await this.parse(Atomic);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);
    const username = await authenticatedClient.getUsername();
    const cliArgs = [
      `${Atomic.cliPackage}@${flags.version}`,
      '--project',
      args.name,
      '--org-id',
      cfg.organization,
      '--api-key',
      apiKey.value!,
      '--platform-url',
      platformUrl({environment: cfg.environment}),
      '--user',
      username,
    ];

    if (flags.pageId) {
      cliArgs.push('--page-id', flags.pageId);
    }

    return spawnProcess(appendCmdIfWindows`npx`, cliArgs);
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
