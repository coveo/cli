import {FilterHostType, SourceModel} from '@coveord/platform-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {CliUx} from '@oclif/core';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import dedent from 'ts-dedent';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {magenta} from 'chalk';
import SourceList from '../list';

/**
 * @TODO: CDX-917: Remove file.
 * @deprecated
 **/
export default class SourcePushList extends CLICommand {
  public static description = `${magenta(
    '[Deprecated]'
  )} List all available push sources in your Coveo organization`;

  public static flags = {
    ...CliUx.ux.table.flags(),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    CliUx.ux.warn(`${magenta('deprecated')} Use ${SourceList.id} instead`);
    const {flags} = await this.parse(SourcePushList);
    const authenticatedClient = new AuthenticatedClient();
    const org = authenticatedClient.cfg.get().organization;
    const platformClient = await authenticatedClient.getClient();

    const sources = await platformClient.source.list({
      filterHostType: FilterHostType.PUSH,
    });

    if (sources.totalEntries === 0) {
      this.log(
        dedent(`
      There is no push source in organization ${org}
      You can create one using source:push:new
      `)
      );
      return;
    }

    CliUx.ux.table(
      this.flattenSourceModels(sources.sourceModels),
      {
        id: {},
        name: {},
        owner: {},
        sourceVisibility: {
          header: 'Source visibility',
        },
        status: {},
        numberOfDocuments: {
          header: 'Number of documents',
        },
      },
      {...flags}
    );
  }

  private flattenSourceModels(sourceModels: SourceModel[]) {
    return sourceModels.map((sourceModel) => ({
      ...sourceModel,
      status: sourceModel.information?.sourceStatus?.type,
      numberOfDocuments: sourceModel.information?.numberOfDocuments,
    }));
  }
}
