import {Command} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
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
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {spawnProcess} from '../../../lib/utils/process';

interface AtomicArguments {
  name: string;
}

export default class Atomic extends Command {
  public static cliPackage = '@coveo/create-atomic';
  public static requiredNodeVersion = '>=8.9.4';
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
  public static hidden = true;

  // TODO: add @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsNpxInstalled(),
    IsNodeVersionInRange(Atomic.requiredNodeVersion),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    await this.createProject();
    this.displayFeedbackAfterSuccess();
    // TODO: add env variables
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  // TODO: add @Trackable()
  public async catch(err?: Error) {
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, {}, err)
    );
    throw err;
  }

  private async createProject() {
    return spawnProcess(appendCmdIfWindows`npx`, [
      `${Atomic.cliPackage}@${getPackageVersion(Atomic.cliPackage)}`,
      this.args.name,
    ]);
  }

  private get args() {
    const {args} = this.parse<{}, AtomicArguments>(Atomic);
    return args;
  }

  private displayFeedbackAfterSuccess() {
    this.log(`
    To get started:

    cd ${this.args.name}
    npm install
    npm start

    Happy hacking!
    `);
  }
}
