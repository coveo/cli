import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {ux} from '@oclif/core';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {Config} from '@coveo/cli-commons/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import dedent from 'ts-dedent';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {recordable} from '../../../lib/utils/record';
import {organization} from '../../../lib/flags/platformCommonFlags';
import {getTargetOrg} from '../../../lib/utils/platform';

export default class List extends CLICommand {
  public static description = 'List available Snapshots in an organization';

  public static flags = {
    ...ux.table.flags(),
    ...organization(
      'The unique identifier of the organization containing the snapshots.'
    ),
  };

  public static examples = ['coveo org:resources:list -o=myOrgId'];

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(List);
    const org = getTargetOrg(this.configuration, flags.organization);
    const platformClient = await new AuthenticatedClient().getClient({
      organization: org,
    });
    const snapshots = await platformClient.resourceSnapshot.list();
    if (snapshots.length === 0) {
      this.log(
        dedent(
          `There is no configuration snapshot available in organization ${org}`
        )
      );
      return;
    }

    ux.table(
      recordable(snapshots),
      {
        id: {},
        createdBy: {
          header: 'Created by',
        },
        createdDate: {
          get: (row) => row.createdDate && new Date(row.createdDate),
          header: 'Created date',
        },
        targetId: {header: 'Target id'},
        developerNote: {header: 'Developer note'},
      },
      {...flags}
    );
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
