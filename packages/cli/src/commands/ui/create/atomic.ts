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
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {spawnProcess} from '../../../lib/utils/process';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

interface AtomicArguments {
  name: string;
}

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
    version: flags.string({
      char: 'v',
      description: `The version of ${Atomic.cliPackage} to use.`,
      default: getPackageVersion(Atomic.cliPackage),
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
    this.displayFeedbackAfterSuccess();
    // TODO: add env variables
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private async createProject() {
    return spawnProcess(appendCmdIfWindows`npx`, [
      `${Atomic.cliPackage}@${flags.version}`,
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
    npm start

    Happy hacking!
    `);
  }
}
