import {SourceType} from '@coveo/platform-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {green} from 'chalk';
import dedent from 'ts-dedent';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {writeSourceContentPrivilege} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {withSourceVisibility} from '../../../lib/commonFlags';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {Args} from '@oclif/core';

export default class SourcePushNew extends CLICommand {
  public static description =
    'Create a new push source in a Coveo organization';

  public static flags = {
    ...withSourceVisibility(),
  };

  public static args = {
    name: Args.string({
      description: 'The name of the application to create.',
      required: true,
    }),
  };

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(writeSourceContentPrivilege)
  )
  //TODO: Code repetition with ../catalog/new.ts , refactor
  public async run() {
    const {flags, args} = await this.parse(SourcePushNew);
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();

    const res = await platformClient.source.create({
      sourceType: SourceType.PUSH,
      pushEnabled: true,
      name: args.name,
      sourceVisibility: flags.sourceVisibility,
    });

    this.log(
      green(
        dedent(
          `Source ${args.name} with visibility ${flags.sourceVisibility} has been successfully created.
        Id: ${res.id}`
        )
      )
    );
  }
}
