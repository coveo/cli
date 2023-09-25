import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {UnknownError} from '@coveo/cli-commons/errors/unknownError';
import {Args, Flags} from '@oclif/core';
import inquirer from 'inquirer';
import npf from '@coveo/cli-commons/npm/npf';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {getPackageVersion} from '../../lib/utils/misc';
import {handleForkedProcess} from '../../lib/utils/process';
import {SubprocessError} from '../../lib/errors/subprocessError';
import {isAggregatedErrorLike} from '../../lib/utils/errorSchemas';

export default class AtomicComponent extends CLICommand {
  public static description =
    'Scaffold a new custom component. Meant to be executed in a component library created using the `coveo atomic:init --lib` command, or in an npm project, or in an empty folder.';
  public static aliases = ['atomic:cmp'];

  public static examples = [
    '<%= config.bin %> <%= command.id %> --type=page myAwesomeComponent',
    '<%= config.bin %> <%= command.id %> --type=result mySuperResultComponent',
  ];

  public static flags = {
    type: Flags.string({
      description: 'The kind of component to initialize.',
      options: ['page', 'result'],
    }),
  };

  public static args = {
    name: Args.string({
      description: 'The name of your component.',
      required: true,
    }),
  };

  @Trackable()
  public async run(): Promise<void> {
    const {initializer, name} = await this.getSpawnOptions();
    const forkedProcess = npf(initializer, [name], {stdio: 'inherit'});
    try {
      await handleForkedProcess(forkedProcess);
    } catch (error) {
      if (isAggregatedErrorLike(error)) {
        const stderrMessageParts = [error.message];
        stderrMessageParts.push(
          ...error.errors.map((suberror) => ` • ${suberror}`)
        );
        throw new SubprocessError(error.message, stderrMessageParts.join('\n'));
      } else {
        throw error;
      }
    }
  }

  private async getSpawnOptions() {
    const {args, flags} = await this.parse(AtomicComponent);
    const type = flags.type || (await this.askType());

    const initializerPackage = this.getInitializerPackage(type);

    // TODO CDX-1340: Refactor the replace into a well named utils.
    return {
      initializer: `${initializerPackage}@${getPackageVersion(
        initializerPackage
      )}`,
      name: args.name,
    };
  }

  private async askType(): Promise<string> {
    const responses = await inquirer.prompt([
      {
        name: 'type',
        message: 'What kind of component do you want to scaffold?',
        type: 'list',
        choices: [{name: 'result'}, {name: 'page'}],
      },
    ]);
    return responses.type;
  }

  private getInitializerPackage(type: string): string {
    switch (type) {
      case 'page':
        return '@coveo/create-atomic-component';
      case 'result':
        return '@coveo/create-atomic-result-component';
      default:
        throw new UnknownError();
    }
  }
}
