import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {Preconditions} from '@coveo/cli-commons/preconditions/index';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {Config} from '@coveo/cli-commons/config/config';
import {
  atomicAppInitializerPackage,
  atomicAppPreconditions,
  createAtomicApp,
} from '../../../lib/atomic/createAtomicProject';

export default class Atomic extends CLICommand {
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
      description: `The version of ${atomicAppInitializerPackage} to use.`,
      default: 'latest',
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
  @Preconditions(...atomicAppPreconditions)
  public async run() {
    const {flags, args} = await this.parse(Atomic);
    const cfg = this.configuration.get();

    await createAtomicApp({
      initializerVersion: flags.version,
      pageId: flags.pageId,
      projectName: args.name,
      cfg,
    });
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
