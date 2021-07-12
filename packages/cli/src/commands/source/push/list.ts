import {FilterHostType, SourceModel} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {Command} from '@oclif/command';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';

export default class SourcePushList extends Command {
  public static description =
    'List all available push sources in your Coveo organization';

  public static flags = {
    ...cli.table.flags(),
  };

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(SourcePushList);
    const authenticatedClient = new AuthenticatedClient();
    const org = (await authenticatedClient.cfg.get()).organization;
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

    cli.table(
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

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(SourcePushList);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
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
