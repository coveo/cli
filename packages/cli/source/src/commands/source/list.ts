import {FilterHostType, SourceModel} from '@coveord/platform-client';
import {Command, CliUx} from '@oclif/core';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import dedent from 'ts-dedent';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

export default class SourceList extends Command {
  public static description =
    'List all available push sources in your Coveo organization';

  public static flags = {
    ...CliUx.ux.table.flags(),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(SourceList);
    const authenticatedClient = new AuthenticatedClient();
    const org = authenticatedClient.cfg.get().organization;
    const platformClient = await authenticatedClient.getClient();

    const sources = await platformClient.source.list({
      filterHostType: FilterHostType.PUSH,
    });

    if (sources.totalEntries === 0) {
      this.log(
        dedent(`
      There is no push nor catalog source in organization ${org}
      You can:
      * create a push source using source:push:new
      * create a catalog source using source:catalog:new
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
        sourceType: {
          header: 'Source type',
        },
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

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private flattenSourceModels(sourceModels: SourceModel[]) {
    return sourceModels.map((sourceModel) => ({
      ...sourceModel,
      status: sourceModel.information?.sourceStatus?.type,
      numberOfDocuments: sourceModel.information?.numberOfDocuments,
    }));
  }
}
