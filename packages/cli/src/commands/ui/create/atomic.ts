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
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {spawnProcess} from '../../../lib/utils/process';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {Config} from '../../../lib/config/config';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {platformUrl} from '../../../lib/platform/environment';
export default class Atomic extends Command {
  public static cliPackage = '@coveo/create-atomic';
  public static requiredNodeVersion = '>=14.0.0';
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
      // default: getPackageVersion(Atomic.cliPackage), TODO: uncomment when @coveo/create-atomic added to package.json
      default: 'latest',
    }),
  };
  public static hidden = true;

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsNpxInstalled(),
    IsNodeVersionInRange(Atomic.requiredNodeVersion),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    await this.createProject();
    await this.displayFeedbackAfterSuccess();
  }

  @Trackable()
  public async catch(err?: Record<string, unknown>) {
    throw err;
  }

  private async createProject() {
    const {flags, args} = await this.parse(Atomic);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

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
      userInfo.providerUsername,
    ];

    return spawnProcess(appendCmdIfWindows`npx`, cliArgs);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async displayFeedbackAfterSuccess() {
    const {args} = await this.parse(Atomic);
    this.log(`
    To get started:

    cd ${args.name}
    npm start

    Happy hacking!
    `);
  }
}
