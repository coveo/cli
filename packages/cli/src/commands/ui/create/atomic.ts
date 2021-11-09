import {Command} from '@oclif/command';
import {
  Preconditions,
  IsAuthenticated,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions/';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {spawnProcess} from '../../../lib/utils/process';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

interface AtomicArguments {
  name: string;
}

export default class Atomic extends Command {
  public static description =
    "Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and <https://docs.coveo.com/headless>.";

  public static args = [
    {
      name: 'name',
      description: 'The name of the application to create.',
      required: true,
    },
  ];
  public static hidden = true;

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    await this.createProject();
    this.displayFeedbackAfterSuccess();
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private async createProject() {
    spawnProcess(appendCmdIfWindows`echo`, [
      '...creating new Atomic project:',
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
    npm run start

    Happy hacking!
    `);
  }
}
