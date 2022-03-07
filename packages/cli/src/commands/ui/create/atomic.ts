import {Command, flags} from '@oclif/command';
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
import {getPackageVersion} from '../../../lib/utils/misc';

interface AtomicArguments {
  name: string;
}

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
    version: flags.string({
      char: 'v',
      description: `The version of ${Atomic.cliPackage} to use.`,
      default: getPackageVersion(Atomic.cliPackage) || 'latest',
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
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    await this.createProject();
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private async createProject() {
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    console.log('Create api key');
    const apiKey = await authenticatedClient.createImpersonateApiKey(
      this.args.name
    );
    console.log('API key created');
    console.log('Get user info');
    const username = await authenticatedClient.getUsername();
    console.log('User info retrieved');
    const cliArgs = [
      `${Atomic.cliPackage}@${this.flags.version}`,
      '--project',
      this.args.name,
      '--org-id',
      cfg.organization,
      '--api-key',
      apiKey.value!,
      '--platform-url',
      platformUrl({environment: cfg.environment}),
      '--user',
      username,
    ];

    return spawnProcess(appendCmdIfWindows`npx`, cliArgs);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get args() {
    const {args} = this.parse<{}, AtomicArguments>(Atomic);
    return args;
  }

  private get flags() {
    const {flags} = this.parse(Atomic);
    return flags;
  }
}
